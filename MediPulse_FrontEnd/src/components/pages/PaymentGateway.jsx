// src/components/pages/PaymentGateway.jsx
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";

// Load your publishable key safely (better to use env)
const stripePromise = loadStripe("pk_test_51RZqlJQOp77hGzL31tRpA6mK4AkNw6gyfGOJ6fZUkxPHnJFVhRkO3G2oILUeNdrxDrw6FyDM7aWWXbd5AwVSkWfm003yNj5PvY");

export const redirectToCheckout = async (amount) => {
  const stripe = await stripePromise;

  const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  const data = await res.json();

  if (data.id) {
    await stripe.redirectToCheckout({ sessionId: data.id });
  } else {
    console.error("Stripe session creation failed:", data.error);
  }
};

// Optional component (can be removed if unused)
const PaymentGateway = () => {
  return <p>Redirecting to Stripe...</p>;
};

export default PaymentGateway;
