import type Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        if (!workspaceId) {
          console.error("[stripe/webhook] checkout.session.completed: missing workspaceId in metadata");
          break;
        }
        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: "PRO",
            stripeCustomerId: session.customer as string,
            stripeSubId: session.subscription as string,
          },
        });
        console.log(`[stripe/webhook] workspace ${workspaceId} upgraded to PRO`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspaceId;
        if (!workspaceId) {
          console.error("[stripe/webhook] subscription.updated: missing workspaceId in metadata");
          break;
        }
        const isActive = sub.status === "active" || sub.status === "trialing";
        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: isActive ? "PRO" : "FREE",
            stripeSubId: sub.id,
            planExpiresAt: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
          },
        });
        console.log(`[stripe/webhook] workspace ${workspaceId} subscription updated — status: ${sub.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspaceId;
        if (!workspaceId) {
          console.error("[stripe/webhook] subscription.deleted: missing workspaceId in metadata");
          break;
        }
        await db.workspace.update({
          where: { id: workspaceId },
          data: {
            plan: "FREE",
            stripeSubId: null,
            planExpiresAt: null,
          },
        });
        console.log(`[stripe/webhook] workspace ${workspaceId} downgraded to FREE`);
        break;
      }

      default:
        // Silently ignore unhandled events
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] Error processing event ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
