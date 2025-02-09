// File: app/api/posts/[id]/comment/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Convert the route parameter 'id' to a number for the post ID.
    const { id } = await params;

    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Retrieve the user token to get the current user's ID.
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Explicitly cast token to ensure token.id is a string.
    const tokenData = token as { id: string };
    const userId = parseInt(tokenData.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }


    // Parse the request body for the comment content.
    const body = await request.json();
    const { content } = body;
    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing or invalid comment content" }, { status: 400 });
    }

    // Create a new comment for the post.
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
    });

    return NextResponse.json({ message: "Comment added", comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
