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
        const workspaceId = session.metadata?.workspace_id;
        const userId = session.metadata?.user_id;

        if (!workspaceId) {
          console.error("[stripe/webhook] checkout.session.completed: missing workspace_id in metadata");
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

        console.log(`[stripe/webhook] workspace ${workspaceId} upgraded to PRO (user: ${userId})`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspace_id;

        if (!workspaceId) {
          console.error("[stripe/webhook] subscription.deleted: missing workspace_id in metadata");
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

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const workspace = await db.workspace.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true, name: true },
        });

        if (!workspace) {
          console.warn(`[stripe/webhook] invoice.payment_failed: no workspace found for customer ${customerId}`);
          break;
        }

        await db.workspace.update({
          where: { id: workspace.id },
          data: { plan: "PAYMENT_FAILED" },
        });

        console.warn(
          `[stripe/webhook] Payment failed — workspace "${workspace.name}" (${workspace.id}) marked as PAYMENT_FAILED`,
        );
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
