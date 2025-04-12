import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, customerName, customerEmail, paymentReference, paymentDescription, redirectUrl, paymentMethods } =
      body

    // Validate required fields
    if (!amount || !customerName || !customerEmail || !paymentReference) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Get API credentials from environment variables
    const apiKey = process.env.MONNIFY_API_KEY
    const secretKey = process.env.MONNIFY_SECRET_KEY
    const contractCode = process.env.MONNIFY_CONTRACT_CODE
    const baseUrl = process.env.MONNIFY_BASE_URL

    if (!apiKey || !secretKey || !contractCode || !baseUrl) {
      return NextResponse.json({ message: "API credentials not configured" }, { status: 500 })
    }

    // Create the authorization string
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString("base64")

    // Get authentication token directly
    const authResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { error: errorText }
      }
      console.error("Authentication error details:", errorData)
      return NextResponse.json(
        { message: `Authentication failed: ${authResponse.status} ${authResponse.statusText}` },
        { status: 401 },
      )
    }

    const authData = await authResponse.json()

    if (!authData.requestSuccessful) {
      return NextResponse.json({ message: `Authentication failed: ${authData.responseMessage}` }, { status: 401 })
    }

    const accessToken = authData.responseBody.accessToken

    // Initialize transaction with Monnify
    const response = await fetch(`${baseUrl}/api/v1/merchant/transactions/init-transaction`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        customerName,
        customerEmail,
        paymentReference,
        paymentDescription,
        redirectUrl,
        paymentMethods,
        currencyCode: "NGN",
        contractCode: contractCode,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Monnify API error:", data)
      return NextResponse.json(
        {
          message: `Failed to initialize transaction: ${data.responseMessage || response.statusText}`,
        },
        { status: response.status },
      )
    }

    if (!data.requestSuccessful) {
      return NextResponse.json({ message: data.responseMessage }, { status: 400 })
    }

    return NextResponse.json({
      transactionReference: data.responseBody.transactionReference,
      paymentReference: data.responseBody.paymentReference,
      checkoutUrl: data.responseBody.checkoutUrl,
    })
  } catch (error) {
    console.error("Error initializing transaction:", error)
    return NextResponse.json(
      {
        message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
