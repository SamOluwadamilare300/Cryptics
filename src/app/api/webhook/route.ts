import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("monnify-signature")

    if (!signature) {
      return NextResponse.json({ message: "Missing signature header" }, { status: 400 })
    }

    // Verify webhook signature
    const secretKey = process.env.MONNIFY_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ message: "Secret key not configured" }, { status: 500 })
    }

    const computedSignature = crypto.createHmac("sha512", secretKey).update(body).digest("hex")

    if (computedSignature !== signature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    }

    // Process the webhook payload
    const payload = JSON.parse(body)

    // Here you would typically:
    // 1. Update your database with the payment status
    // 2. Trigger any business logic based on the payment event
    console.log("Webhook received:", payload)

    // Example: Check if payment is completed
    if (payload.eventType === "SUCCESSFUL_TRANSACTION") {
      // Update order status, send confirmation email, etc.
      console.log("Payment successful:", payload.eventData.paymentReference)
    }

    return NextResponse.json({ message: "Webhook processed successfully" })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
