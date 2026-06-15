import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

export async function getOrCreateCustomer({
  existingCustomerId,
  email,
  name,
  workspaceId,
}: {
  existingCustomerId?: string | null;
  email: string;
  name: string;
  workspaceId: string;
}): Promise<string> {
  if (existingCustomerId) return existingCustomerId;
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { workspaceId },
  });
  return customer.id;
}

export async function createCheckoutSession({
  workspaceId,
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  workspaceId: string;
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { workspaceId },
    subscription_data: { metadata: { workspaceId } },
  });
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
