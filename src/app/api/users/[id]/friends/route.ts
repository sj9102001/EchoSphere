// File: app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
    console.log('id', id)
  try {
    const getFriendName = async (userId: number) => {
        const friend = await prisma.friend.findFirst({
          where: {
            OR: [
              { user1Id: userId },
              { user2Id: userId }
            ]
          },
          select: {
            user1Id: true,
            user2Id: true,
            user1: { select: { name: true } },
            user2: { select: { name: true } }
          }
        });
      
        if (!friend) {
          return null; // No friend found
        }
      
        return friend.user1Id === userId ? friend.user2.name : friend.user1.name;
      };
      

    if (!getFriendName) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(getFriendName);
  } catch (error) {
    console.log(error);
    console.log('id', id)
  }
}
