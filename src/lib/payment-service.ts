import { generateRandomString } from "./utils"

// Types for the payment service
export interface TransactionInitializeRequest {
  amount: number
  customerName: string
  customerEmail: string
  paymentMethods: Array<"CARD" | "ACCOUNT_TRANSFER">
  paymentReference?: string
  paymentDescription?: string
  redirectUrl?: string
}

export interface TransactionInitializeResponse {
  transactionReference: string
  paymentReference: string
  checkoutUrl: string
}

export interface PaymentVerificationResponse {
  paymentStatus: string
  paidAmount: number
  paymentReference: string
  transactionReference: string
  paymentMethod: string
}

// Function to get authentication token
export async function getAuthToken(): Promise<string> {
  try {
    const apiKey = process.env.MONNIFY_API_KEY
    const secretKey = process.env.MONNIFY_SECRET_KEY

    if (!apiKey || !secretKey) {
      throw new Error("API Key or Secret Key not configured")
    }

    // Create the authorization string correctly
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString("base64")

    const response = await fetch(`${process.env.MONNIFY_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure we don't use cached responses
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { error: errorText }
      }
      console.error("Authentication error details:", errorData)
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.requestSuccessful) {
      throw new Error(`Authentication failed: ${data.responseMessage || "Unknown error"}`)
    }

    return data.responseBody.accessToken
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}

// Function to initialize a transaction
export async function initializeTransaction(
  request: TransactionInitializeRequest,
): Promise<TransactionInitializeResponse> {
  try {
    // Generate a unique payment reference if not provided
    const paymentReference = request.paymentReference || `MONNIFY_${generateRandomString(10)}`

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
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to initialize transaction")
    }

    return await response.json()
  } catch (error) {
    console.error("Error initializing transaction:", error)
    throw error
  }
}

// Function to verify payment status
export async function verifyPayment(paymentReference: string): Promise<PaymentVerificationResponse> {
  try {
    const response = await fetch(`/api/verify-payment?paymentReference=${paymentReference}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to verify payment")
    }

    return await response.json()
  } catch (error) {
    console.error("Error verifying payment:", error)
    throw error
  }
}
