import { NextResponse } from "next/server"

export async function GET() {
  // Check if environment variables are set
  const apiKey = process.env.MONNIFY_API_KEY
  const secretKey = process.env.MONNIFY_SECRET_KEY
  const contractCode = process.env.MONNIFY_CONTRACT_CODE
  const baseUrl = process.env.MONNIFY_BASE_URL

  // Create safe versions of the environment variables for the client
  return NextResponse.json({
    apiKeySet: !!apiKey,
    secretKeySet: !!secretKey,
    contractCodeSet: !!contractCode,
    baseUrl: baseUrl,
    apiKeyFirstChars: apiKey ? apiKey.substring(0, 4) + "..." : null,
    secretKeyFirstChars: secretKey ? secretKey.substring(0, 4) + "..." : null,
    contractCodeFirstChars: contractCode ? contractCode.substring(0, 4) + "..." : null,
  })
}
