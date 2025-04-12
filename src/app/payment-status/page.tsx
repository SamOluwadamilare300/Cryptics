"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { verifyPayment, type PaymentVerificationResponse } from "@/lib/payment-service"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"

export default function PaymentStatusPage() {
  const { userId } = useAuth() // Use Clerk's client-side auth
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [paymentDetails, setPaymentDetails] = useState<PaymentVerificationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const paymentReference = searchParams.get("paymentReference")

    if (!paymentReference) {
      setStatus("failed")
      setError("Payment reference not found")
      return
    }

    const verifyPaymentStatus = async () => {
      try {
        const response = await verifyPayment(paymentReference)
        setPaymentDetails(response)

        if (response.paymentStatus === "PAID") {
          setStatus("success")

          // Get stored form values from localStorage
          const storedValues = localStorage.getItem("monnifyFormValues")
          if (!storedValues) {
            throw new Error("Form values not found in storage")
          }

          const { name, category } = JSON.parse(storedValues)

          console.log("Payment successful, creating group...")
          const groupResponse = await fetch("/api/create-group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId, // Use authenticated userId
              name,
              category,
            }),
          })

          if (!groupResponse.ok) {
            const errorData = await groupResponse.json()
            throw new Error(errorData.message || "Failed to create group")
          }

          const groupData = await groupResponse.json()
          console.log("Group created:", groupData)

          // Clean up localStorage
          localStorage.removeItem("monnifyPaymentRef")
          localStorage.removeItem("monnifyFormValues")

          toast.success("Group created successfully!")
         
          console.log("Redirecting to:", `/group/${groupData.group.id}/channel/${groupData.group.channels[0].id}`);
          // Redirect to the group channel page
          router.push(
            `/group/${groupData.group.id}/channel/${groupData.group.channels[0].id}`
          )
        } else {
          setStatus("failed")
          setError(`Payment ${response.paymentStatus.toLowerCase()}`)
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
        setStatus("failed")
        setError(error instanceof Error ? error.message : "Failed to verify payment status")
      }
    }

    // Verify payment status
    if (userId) verifyPaymentStatus()
  }, [searchParams, router, userId]) // Added userId as a dependency

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-center text-lg">Verifying payment...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-500">Payment Successful!</h2>
                  {paymentDetails && (
                    <div className="mt-4 space-y-2 text-left">
                      <p>
                        <span className="font-semibold">Amount:</span> {formatCurrency(paymentDetails.paidAmount)}
                      </p>
                      <p>
                        <span className="font-semibold">Reference:</span> {paymentDetails.paymentReference}
                      </p>
                      <p>
                        <span className="font-semibold">Method:</span> {paymentDetails.paymentMethod}
                      </p>
                    </div>
                  )}
                  <p className="mt-4">Redirecting to your group...</p>
                </div>
              </>
            )}

            {status === "failed" && (
              <>
                <XCircle className="h-16 w-16 text-red-500" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-red-500">Payment Failed</h2>
                  <p className="mt-2">{error || "An error occurred during payment processing"}</p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}