import { generateRandomString } from "./utils";

// Types for the payment service
export interface TransactionInitializeRequest {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentMethods: Array<"CARD" | "ACCOUNT_TRANSFER">;
  paymentReference?: string;
  paymentDescription?: string;
  redirectUrl?: string;
}

export interface TransactionInitializeResponse {
  transactionReference: string;
  paymentReference: string;
  checkoutUrl: string;
}

export interface PaymentVerificationResponse {
  paymentStatus: string;
  paidAmount: number;
  paymentReference: string;
  transactionReference: string;
  paymentMethod: string;
}

// Function to initialize a transaction
export async function initializeTransaction(
  request: TransactionInitializeRequest
): Promise<TransactionInitializeResponse> {
  try {
    // Generate a unique payment reference if not provided
    const paymentReference = request.paymentReference || `MONNIFY_${generateRandomString(10)}`;

    // Send an API request to initialize the transaction
    const response = await fetch("/api/initialize-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...request,
        paymentReference,
        paymentDescription: request.paymentDescription || `Payment for ${request.customerName}`,
        redirectUrl: request.redirectUrl || `${window.location.origin}/payment-status`,
      }),
    });

    // Handle errors if the response is not OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to initialize transaction");
    }

    // Return the transaction details
    return await response.json();
  } catch (error) {
    console.error("Error initializing transaction:", error);
    throw error;
  }
}

// Function to verify payment status
export async function verifyPayment(paymentReference: string): Promise<PaymentVerificationResponse> {
  try {
    // Retrieve groupName and userId from localStorage
    const groupDetails = JSON.parse(localStorage.getItem("monnifyFormValues") || "{}");
    const groupName = groupDetails.groupName;
    const userId = localStorage.getItem("userId");

    if (!groupName || !userId) {
      console.error("Missing groupName or userId:", { groupName, userId });
      throw new Error("Group name and user ID are required to create a group");
    }

    // Call the verify-payment API with all required parameters
    const response = await fetch(
      `/api/verify-payment?paymentReference=${paymentReference}&groupName=${groupName}&userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to verify payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
}