import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { page, limit} = Object.fromEntries(
      request.nextUrl.searchParams
    );

    // Pagination defaults
    const pageNumber = parseInt(page || '1', 10);
    const pageSize = parseInt(limit || '10', 10);
    const skip = (pageNumber - 1) * pageSize;

    // Query for posts
    const where = {visibility: 'public'};

    // Fetch posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        comments: true,
        likes: true,
        mediaUrls: true,
      },
    });

    // Count total posts
    const totalPosts = await prisma.post.count({ where });

    // Pagination metadata
    const totalPages = Math.ceil(totalPosts / pageSize);

    const response = {
      data: posts,
      meta: {
        currentPage: pageNumber,
        pageSize,
        totalPosts,
        totalPages,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
