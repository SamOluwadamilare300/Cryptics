import { type NextRequest, NextResponse } from "next/server"

// Update the verify-payment route to use direct authentication
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentReference = searchParams.get("paymentReference")

    if (!paymentReference) {
      return NextResponse.json({ message: "Payment reference is required" }, { status: 400 })
    }

    // Get API credentials from environment variables
    const apiKey = process.env.MONNIFY_API_KEY
    const secretKey = process.env.MONNIFY_SECRET_KEY
    const baseUrl = process.env.MONNIFY_BASE_URL

    if (!apiKey || !secretKey || !baseUrl) {
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

    // Verify payment with Monnify
    const response = await fetch(`${baseUrl}/api/v1/merchant/transactions/query?paymentReference=${paymentReference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Monnify API error:", data)
      return NextResponse.json(
        {
          message: `Failed to verify payment: ${data.responseMessage || response.statusText}`,
        },
        { status: response.status },
      )
    }

    if (!data.requestSuccessful) {
      return NextResponse.json({ message: data.responseMessage }, { status: 400 })
    }

    return NextResponse.json({
      paymentStatus: data.responseBody.paymentStatus,
      paidAmount: data.responseBody.amountPaid,
      paymentReference: data.responseBody.paymentReference,
      transactionReference: data.responseBody.transactionReference,
      paymentMethod: data.responseBody.paymentMethod,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
