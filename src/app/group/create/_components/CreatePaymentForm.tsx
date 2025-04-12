"use client"

import { onTransferCommission } from "@/actions/payments"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  verifyPayment,
  type PaymentVerificationResponse,
} from "@/lib/payment-service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

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
  paymentMethod: z.enum(["CARD", "ACCOUNT_TRANSFER", "CRYPTO"], {
    required_error: "Please select a payment method.",
  }),
})

export type MonnifyPaymentFormProps = {
  userId: string
  affiliate: boolean
  monnifyId?: string
}

export default function MonnifyPaymentForm({
  userId,
  affiliate,
  monnifyId,
}: MonnifyPaymentFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  )
  const [paymentDetails, setPaymentDetails] =
    useState<PaymentVerificationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      customerEmail: "",
      paymentMethod: "ACCOUNT_TRANSFER",
    },
  })

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (pollingRef.current) {
        clearTimeout(pollingRef.current)
      }
    }
  }, [])


  const onCreateGroup = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const paymentResponse = await fetch("/api/direct-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1000,
          customerName: values.name,
          customerEmail: values.customerEmail,
          paymentMethods: [values.paymentMethod],
          userId,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || "Failed to initialize payment")
      }

      if (paymentData.checkoutUrl) {
        // Store payment reference before redirecting
        localStorage.setItem("monnifyPaymentRef", paymentData.paymentReference)

        // Store form values in localStorage
        localStorage.setItem(
          "monnifyFormValues",
          JSON.stringify({
            name: values.name,
            category: values.category,
          }),
        )

        // Redirect to Monnify checkout
        window.location.href = paymentData.checkoutUrl
      } else {
        throw new Error("No checkout URL returned from the API")
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        )
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="px-7 flex flex-col gap-4">
      {/* <h5 className="font-bold text-base text-themeTextWhite">Create Your Campus</h5>
      <p className="text-themeTextGray leading-tight">
        Get started by creating your campus community
      </p> */}

      {error && <div className="text-sm text-red-500 mt-2 italic">{error}</div>}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCreateGroup)} className="space-y-6">
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
                    <SelectTrigger className="placeholder:text-gray-600 text-gray-200">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-700">
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
                    <SelectTrigger className="placeholder:text-gray-400 text-gray-200">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="backdrop-blur-md bg-white/80 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-700">
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

          <div className="pt-4">
            <p className="text-sm text-themeTextGray">
              Cancel anytime. By clicking below, you accept our terms.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-themeBlack border-themeGray rounded-xl"
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
  )
}
