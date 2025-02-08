// File: app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  try {
    // Fetch all friend relationships where the user is involved
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      select: {
        user1Id: true,
        user2Id: true,
        user1: { select: { id: true, name: true, profilePicture: true } },
        user2: { select: { id: true, name: true, profilePicture: true } }
      }
    });

    // Map the friend relationships to return the friend details
    // For each friend relationship, if the given user is user1 then return user2; otherwise, return user1.
    const friendList = friends.map(friend =>
      friend.user1Id === userId ? friend.user2 : friend.user1
    );

    return NextResponse.json({ friends: friendList });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
