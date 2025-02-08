// File: app/api/posts/[id]/like/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Convert the route parameter id into a number (Post ID)
    const { id } = await params;

    const postId = parseInt(id, 10);

    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenData = token as { id: string };
    const userId = parseInt(tokenData.id, 10);
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 }
      );
    }

    // Check if a like already exists for this post and user
    const existingLike = await prisma.postLike.findFirst({
      where: { postId, userId },
    });

    if (existingLike) {
      // If already liked, remove the like (toggle off)
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ message: "Unliked" });
    } else {
      // If not liked, create a new like
      const like = await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      return NextResponse.json({ message: "Liked", like });
    }
  } catch (error) {
    console.error("Error in like route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
