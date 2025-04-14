import { type NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentReference = searchParams.get("paymentReference");
    const groupName = searchParams.get("groupName");
    const userId = searchParams.get("userId");

    if (!paymentReference) {
      return NextResponse.json({ message: "Payment reference is required" }, { status: 400 });
    }

    if (!groupName || !userId) {
      console.error("Missing groupName or userId:", { groupName, userId });
      return NextResponse.json(
        { message: "Group name and user ID are required to create a group" },
        { status: 400 }
      );
    }

    // Simulate Monnify payment verification logic
    const paymentDetails = {
      paymentReference,
      transactionReference: "TRANSACTION_REF_123",
      amountPaid: 1000,
    };

    try {
      const group = await client.group.create({
        data: {
          name: groupName,
          userId,
          paymentReference: paymentDetails.paymentReference,
          transactionReference: paymentDetails.transactionReference,
          paidAmount: paymentDetails.amountPaid,
          category: "Default Category",
          status: "PENDING",
          privacy: "PRIVATE",
        },
      });

      return NextResponse.json({
        message: "Payment verified and group created successfully",
        group,
      });
    } catch (error) {
      console.error("Failed to create group:", error);
      return NextResponse.json(
        {
          message: "Payment verified but failed to create group",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}