"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initializeTransaction } from "@/lib/payment-service"; // Initialize Monnify transactions
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(3, {
    message: "Campus name must be at least 3 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  customerEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  paymentMethod: z.enum(["CARD", "ACCOUNT_TRANSFER"], {
    required_error: "Please select a payment method.",
  }),
});

export type MonnifyPaymentFormProps = {
  userId: string;
  affiliate: boolean;
  monnifyId?: string;
};

export default function MonnifyPaymentForm({
  userId,
  affiliate,
  monnifyId,
}: MonnifyPaymentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      customerEmail: "",
      paymentMethod: "ACCOUNT_TRANSFER",
    },
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const onCreateGroup = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Initialize Monnify payment
      const paymentResponse = await initializeTransaction({
        amount: 1000, // Example amount
        customerName: values.name,
        customerEmail: values.customerEmail,
        paymentMethods: [values.paymentMethod],
      });

      if (!paymentResponse || !paymentResponse.checkoutUrl) {
        throw new Error("Failed to initialize payment: No checkout URL returned.");
      }

      // Store payment reference and form values in localStorage
      localStorage.setItem("monnifyPaymentRef", paymentResponse.paymentReference);
      localStorage.setItem(
        "monnifyFormValues",
        JSON.stringify({
          name: values.name,
          category: values.category,
        })
      );
      localStorage.setItem("userId", userId); // Store the userId

      // Redirect to Monnify checkout
      window.location.href = paymentResponse.checkoutUrl;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setIsLoading(false);
      }
      console.error("Error initializing payment:", err);
    }
  };

  return (
    <div className="px-7 flex flex-col gap-4">
      {error && <div className="text-sm text-red-500 mt-2 italic">{error}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateGroup)} className="space-y-6">
          {/* Campus Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campus Name</FormLabel>
                <FormControl>
                  <Input
                    className="placeholder:text-gray-600"
                    placeholder="My Awesome Campus"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="placeholder:text-gray-600">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="community">
                      Personal Development
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className="placeholder:text-gray-600"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Method */}
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="placeholder:text-gray-400">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                  <SelectItem value="CRYPTO">
                      💰 Wallet{" "}
                      <span className="italic mr-2 text-sm text-gray-600">
                        Not available
                      </span>
                    </SelectItem>
                    <SelectItem value="ACCOUNT_TRANSFER">
                      🏛️ Bank Transfer
                    </SelectItem>
                    <SelectItem value="CARD">💳 Card Payment</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
          <span className="block text-center">OR</span>

      <Button
      className="w-full bg-themeBlack border-themeGray rounded-xl"
     asChild
>
      <a href="/explore" className="text-sm text-themeTextGray">
    Skip for now
     </a>
     </Button>
        </form>
      </Form>
    </div>
  );
}