"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { initializeTransaction } from "@/lib/payment-service";

const formSchema = z.object({
  customerName: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  customerEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  amount: z.number().positive({ message: "Amount must be a positive number." }),
  paymentMethod: z.enum(["CARD", "ACCOUNT_TRANSFER"], {
    required_error: "Please select a payment method.",
  }),
});

export default function PaymentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      amount: 1000,
      paymentMethod: "ACCOUNT_TRANSFER",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      localStorage.setItem(
        "monnifyFormValues",
        JSON.stringify({
          groupName: values.customerName,
        })
      );
      localStorage.setItem("userId", "USER_ID_123"); // Replace with actual userId

      const response = await initializeTransaction({
        amount: values.amount,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        paymentMethods: [values.paymentMethod],
      });

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form Fields */}
      <button type="submit">Pay Now</button>
    </form>
  );
}