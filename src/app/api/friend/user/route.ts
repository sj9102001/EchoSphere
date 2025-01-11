import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = typeof token.id === 'string' ? parseInt(token.id, 10) : token.id;
    // Fetch posts
    const friends = await prisma.friend.findMany({
        where: {
          OR: [
            { user1Id: userId }, // Friends where the user is `user1`
            { user2Id: userId }  // Friends where the user is `user2`
          ],
        },
        select: {
          user1: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
          user2: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      });
  
      // Transform results to return only the friend's data
      const friendList = friends.map(friend => {
        // Determine which user is the friend
        const friendData = friend.user1.id === userId ? friend.user2 : friend.user1;
        return {
          id: friendData.id,
          name: friendData.name,
          profilePicture: friendData.profilePicture,
        };
      });
  
      
    // Pagination metadata
    const response = {
      data: friendList,
    };
    console.log(response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
