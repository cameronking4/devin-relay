import { randomUUID } from "crypto";

const ts = () => Math.floor(Date.now() / 1000);
const evtId = () => `evt_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
const piId = () => `pi_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
const invId = () => `in_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
const subId = () => `sub_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
const cusId = () => `cus_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
const chId = () => `ch_${randomUUID().replace(/-/g, "").slice(0, 24)}`;

export function generateStripePayload(eventType: string): {
  payload: unknown;
  headers: Record<string, string>;
} {
  const baseEvent = {
    id: evtId(),
    object: "event",
    api_version: "2024-06-20",
    created: ts(),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  };

  switch (eventType) {
    case "payment_intent_succeeded": {
      const paymentIntentId = piId();
      return {
        payload: {
          ...baseEvent,
          type: "payment_intent.succeeded",
          data: {
            object: {
              id: paymentIntentId,
              object: "payment_intent",
              amount: 4999,
              amount_received: 4999,
              currency: "usd",
              status: "succeeded",
              metadata: {
                order_id: `ord_${Math.floor(Math.random() * 100000)}`,
                customer_email: "customer@example.com",
              },
              payment_method: "pm_1234567890",
              customer: cusId(),
              receipt_email: "customer@example.com",
              created: ts(),
              latest_charge: chId(),
            },
            previous_attributes: {},
          },
        },
        headers: { "Stripe-Signature": "t=1234567890,v1=placeholder" },
      };
    }

    case "invoice_paid": {
      const invoiceId = invId();
      const subscriptionId = subId();
      return {
        payload: {
          ...baseEvent,
          type: "invoice.paid",
          data: {
            object: {
              id: invoiceId,
              object: "invoice",
              amount_paid: 2900,
              amount_due: 0,
              currency: "usd",
              status: "paid",
              billing_reason: "subscription_cycle",
              subscription: subscriptionId,
              customer: cusId(),
              customer_email: "subscriber@example.com",
              period_start: ts() - 2592000,
              period_end: ts(),
              created: ts(),
              lines: {
                data: [
                  {
                    id: `il_${randomUUID().replace(/-/g, "").slice(0, 24)}`,
                    amount: 2900,
                    description: "Pro Plan - Monthly",
                    period: { start: ts() - 2592000, end: ts() },
                  },
                ],
              },
            },
          },
        },
        headers: { "Stripe-Signature": "t=1234567890,v1=placeholder" },
      };
    }

    case "customer_subscription_created": {
      const subscriptionId = subId();
      return {
        payload: {
          ...baseEvent,
          type: "customer.subscription.created",
          data: {
            object: {
              id: subscriptionId,
              object: "subscription",
              status: "active",
              customer: cusId(),
              items: {
                data: [
                  {
                    id: `si_${randomUUID().replace(/-/g, "").slice(0, 24)}`,
                    price: {
                      id: "price_1ABC123",
                      unit_amount: 2900,
                      currency: "usd",
                      recurring: { interval: "month" },
                    },
                  },
                ],
              },
              current_period_start: ts(),
              current_period_end: ts() + 2592000,
              created: ts(),
              metadata: { plan: "pro" },
            },
          },
        },
        headers: { "Stripe-Signature": "t=1234567890,v1=placeholder" },
      };
    }

    case "customer_subscription_deleted": {
      const subscriptionId = subId();
      return {
        payload: {
          ...baseEvent,
          type: "customer.subscription.deleted",
          data: {
            object: {
              id: subscriptionId,
              object: "subscription",
              status: "canceled",
              customer: cusId(),
              canceled_at: ts(),
              ended_at: ts(),
              cancellation_details: { reason: "cancellation_requested", comment: "User requested cancellation" },
            },
          },
        },
        headers: { "Stripe-Signature": "t=1234567890,v1=placeholder" },
      };
    }

    case "charge_failed": {
      const chargeId = chId();
      return {
        payload: {
          ...baseEvent,
          type: "charge.failed",
          data: {
            object: {
              id: chargeId,
              object: "charge",
              amount: 4999,
              currency: "usd",
              status: "failed",
              failure_code: "card_declined",
              failure_message: "Your card was declined.",
              customer: cusId(),
              payment_intent: piId(),
              created: ts(),
            },
          },
        },
        headers: { "Stripe-Signature": "t=1234567890,v1=placeholder" },
      };
    }

    default:
      throw new Error(`Unknown Stripe event type: ${eventType}`);
  }
}
