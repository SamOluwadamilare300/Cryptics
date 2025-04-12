import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get credentials from environment variables
    const apiKey = process.env.MONNIFY_API_KEY
    const secretKey = process.env.MONNIFY_SECRET_KEY
    const baseUrl = process.env.MONNIFY_BASE_URL

    if (!apiKey || !secretKey || !baseUrl) {
      return NextResponse.json({
        success: false,
        message: "Missing environment variables",
      })
    }

    // Create the authorization string
    const authString = Buffer.from(`${apiKey}:${secretKey}`).toString("base64")

    // Make a direct request to the Monnify API
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      cache: "no-store", // Ensure we don't use cached responses
    })

    // Get the raw response text first
    const responseText = await response.text()

    // Try to parse as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = { rawResponse: responseText }
    }

    // Return detailed information about the request and response
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      requestDetails: {
        url: `${baseUrl}/api/v1/auth/login`,
        method: "POST",
        headers: {
          Authorization: `Basic ${authString.substring(0, 5)}...`,
          "Content-Type": "application/json",
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
