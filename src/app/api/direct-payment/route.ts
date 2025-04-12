import { generateRandomString } from "@/lib/utils"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, customerName, customerEmail, paymentMethods } = body

    // Validate required fields
    if (!amount || !customerName || !customerEmail) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Get API credentials from environment variables
    const apiKey = process.env.MONNIFY_API_KEY
    const secretKey = process.env.MONNIFY_SECRET_KEY
    const contractCode = process.env.MONNIFY_CONTRACT_CODE
    const baseUrl = process.env.MONNIFY_BASE_URL

    if (!apiKey || !secretKey || !contractCode || !baseUrl) {
      return NextResponse.json(
        {
          message: "API credentials not configured",
          credentialsCheck: {
            apiKey: !!apiKey,
            secretKey: !!secretKey,
            contractCode: !!contractCode,
            baseUrl: !!baseUrl,
          },
        },
        { status: 500 },
      )
    }

    // Generate a unique payment reference
    const paymentReference = `MONNIFY_${generateRandomString(10)}`
    const redirectUrl = `${request.nextUrl.origin}/payment-status`

    // Step 1: Get authentication token
    console.log("Step 1: Getting authentication token...")

    // Create the authorization string
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString("base64")

    console.log("Auth string created (first 10 chars):", authString.substring(0, 10) + "...")

    const authResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("Auth response status:", authResponse.status, authResponse.statusText)

    // Get the raw response text first for better debugging
    const authResponseText = await authResponse.text()
    console.log("Auth response text:", authResponseText)

    let authData
    try {
      authData = JSON.parse(authResponseText)
    } catch (e) {
      return NextResponse.json(
        {
          message: "Failed to parse authentication response",
          responseText: authResponseText,
          error: e instanceof Error ? e.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    if (!authResponse.ok || !authData.requestSuccessful) {
      return NextResponse.json(
        {
          message: "Authentication failed",
          status: authResponse.status,
          statusText: authResponse.statusText,
          responseData: authData,
        },
        { status: 401 },
      )
    }

    const accessToken = authData.responseBody.accessToken
    console.log("Access token received (first 10 chars):", accessToken.substring(0, 10) + "...")

    // Step 2: Initialize transaction with Monnify
    console.log("Step 2: Initializing transaction...")

    const transactionPayload = {
      amount,
      customerName,
      customerEmail,
      paymentReference,
      paymentDescription: `Payment for ${customerName}`,
      redirectUrl,
      paymentMethods: paymentMethods || ["CARD", "ACCOUNT_TRANSFER"],
      currencyCode: "NGN",
      contractCode,
    }

    console.log("Transaction payload:", JSON.stringify(transactionPayload))

    const transactionResponse = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionPayload),
    })

    console.log("Transaction response status:", transactionResponse.status, transactionResponse.statusText)

    // Get the raw response text first for better debugging
    const transactionResponseText = await transactionResponse.text()
    console.log("Transaction response text:", transactionResponseText)

    let transactionData
    try {
      transactionData = JSON.parse(transactionResponseText)
    } catch (e) {
      return NextResponse.json(
        {
          message: "Failed to parse transaction response",
          responseText: transactionResponseText,
          error: e instanceof Error ? e.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    if (!transactionResponse.ok || !transactionData.requestSuccessful) {
      return NextResponse.json(
        {
          message: "Failed to initialize transaction",
          status: transactionResponse.status,
          statusText: transactionResponse.statusText,
          responseData: transactionData,
        },
        { status: transactionResponse.status },
      )
    }

    // Return success response with checkout URL
    return NextResponse.json({
      success: true,
      message: "Transaction initialized successfully",
      transactionReference: transactionData.responseBody.transactionReference,
      paymentReference: transactionData.responseBody.paymentReference,
      checkoutUrl: transactionData.responseBody.checkoutUrl,
      debugInfo: {
        authStatus: authResponse.status,
        transactionStatus: transactionResponse.status,
      },
    })
  } catch (error) {
    console.error("Error in direct payment:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
