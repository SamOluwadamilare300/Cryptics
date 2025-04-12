import { NextRequest, NextResponse } from "next/server";

// Mock function to create a group in your database
async function createGroupInDatabase({
  name,
  category,
}: {
  userId: string;
  name: string;
  category: string;
}) {
  // Simulate database insertion
  const groupId = Math.floor(Math.random() * 10000); // Replace with actual DB logic
  const channelId = Math.floor(Math.random() * 10000); // Replace with actual DB logic

  if (!groupId || !channelId) {
    throw new Error("Failed to generate group or channel ID.");
  }

  return {
    group: {
      id: groupId,
      name,
      category,
      channels: [
        {
          id: channelId,
          name: "General", // Default channel
        },
      ],
    },
  };
}

// API route to create a group and default channel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, category } = body;

    if (!userId || !name || !category) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the group and default channel
    const groupData = await createGroupInDatabase({ userId, name, category });

    return NextResponse.json(groupData);
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}