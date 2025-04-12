import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the API key and secret key from environment variables
    const apiKey = process.env.MONNIFY_API_KEY
    const secretKey = process.env.MONNIFY_SECRET_KEY
    const baseUrl = process.env.MONNIFY_BASE_URL
    const contractCode = process.env.MONNIFY_CONTRACT_CODE

    // Check if the environment variables are set
    if (!apiKey || !secretKey || !baseUrl || !contractCode) {
      return NextResponse.json({
        success: false,
        message: "Missing environment variables",
        available: {
          apiKey: !!apiKey,
          secretKey: !!secretKey,
          baseUrl: !!baseUrl,
          contractCode: !!contractCode,
        },
      })
    }

    // Create the authorization string
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString("base64")

    // Make a request to the Monnify API to test authentication
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    })

    // Get the response data
    const data = await response.json()

    // Return the response
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: data,
      envVars: {
        apiKey: apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4),
        secretKey: secretKey.substring(0, 4) + "..." + secretKey.substring(secretKey.length - 4),
        baseUrl,
        contractCode,
      },
    })
  } catch (error) {
    // Return any errors
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
