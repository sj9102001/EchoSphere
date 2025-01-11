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
    const posts = await prisma.post.findMany({
        where: {
          userId
        },
        select: {
          id: true, // Post ID
          content: true, // Post content
          createdAt: true, // Creation timestamp
          mediaUrl: true, // Optional media attachment
          user: {
            select: {
              id: true, // User ID
              name: true, // User name
              profilePicture: true, // User profile picture
            },
          },
          comments: {
            select: {
              id: true, // Comment ID
              content: true, // Comment content
              createdAt: true, // Comment timestamp
              user: {
                select: {
                  id: true, // Commenting user's ID
                  name: true, // Commenting user's name
                  profilePicture: true, // Commenting user's profile picture
                },
              },
            },
          },
          likes: {
            select: {
              userId: true, // ID of the user who liked the post
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Sort by most recent posts
        },
      });
      
    // Pagination metadata
    const response = {
      data: posts,
    };
    console.log(response);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
