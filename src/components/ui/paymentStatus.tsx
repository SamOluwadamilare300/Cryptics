import { verifyPayment } from "@/lib/payment-service";
import { useEffect } from "react";

export default function PaymentStatusPage() {
  useEffect(() => {
    async function verifyPaymentStatus() {
      try {
        const paymentReference = "MONNIFY_REF_12345"; // Replace with the actual reference
        await verifyPayment(paymentReference); // This calls the updated function in payment-service.ts
      } catch (error) {
        console.error("Error verifying payment:", error); // Log the error
      }
    }

    verifyPaymentStatus();
  }, []);

  return <div>Verifying Payment...</div>;
}