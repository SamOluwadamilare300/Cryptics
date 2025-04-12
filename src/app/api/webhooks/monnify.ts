import { NextRequest, NextResponse } from "next/server";

// Webhook handler for Monnify notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { eventType, transactionReference, paymentReference } = body;

    // Log the webhook payload for debugging
    console.log("Monnify Webhook Payload:", body);

    if (!eventType || !transactionReference || !paymentReference) {
      return NextResponse.json(
        { message: "Missing required fields in webhook payload" },
        { status: 400 }
      );
    }

    // Handle payment success event
    if (eventType === "SUCCESSFUL_TRANSACTION") {
      // Call your group creation API or logic here
      const groupResponse = await fetch("/api/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentReference,
          transactionReference,
          // You may pass other metadata (e.g., userId, category, etc.) here
        }),
      });

      if (!groupResponse.ok) {
        console.error("Failed to create group:", await groupResponse.json());
        return NextResponse.json(
          { message: "Failed to create group after payment success" },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Group created successfully" });
    }

    // Handle payment failure or other events
    if (eventType === "FAILED_TRANSACTION") {
      console.error("Payment failed for reference:", paymentReference);
      return NextResponse.json({ message: "Payment failed" });
    }

    // Handle other event types if necessary
    console.warn("Unhandled event type:", eventType);
    return NextResponse.json({ message: "Unhandled event type" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}