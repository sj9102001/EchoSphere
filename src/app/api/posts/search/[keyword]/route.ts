import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const { userId, search, page, limit, sortBy, sortOrder } = Object.fromEntries(
      request.nextUrl.searchParams
    );

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Pagination defaults
    const pageNumber = parseInt(page || '1', 10);
    const pageSize = parseInt(limit || '10', 10);
    const skip = (pageNumber - 1) * pageSize;

    // Sorting defaults
    const sortField = sortBy || 'createdAt';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    // Define type for Friend
    type Friend = {
      user1Id: number;
      user2Id: number;
    };

    // Fetch friends of the user
    const friendIds: Friend[] = await prisma.friend.findMany({
      where: {
        OR: [
          { user1Id: parseInt(userId, 10) },
          { user2Id: parseInt(userId, 10) },
        ],
      },
      select: {
        user1Id: true,
        user2Id: true,
      },
    });

    // Map friend IDs
    const friends = friendIds.map((friend: Friend) =>
      friend.user1Id === parseInt(userId, 10) ? friend.user2Id : friend.user1Id
    );

    // Query for posts
    const where = {
      AND: [
        {
          OR: [
            { visibility: 'public' },
            {
              AND: [
                { visibility: 'friends-only' },
                { userId: { in: friends } },
              ],
            },
          ],
        },
        search
          ? {
              OR: [
                { content: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {},
      ],
    };

    // Fetch posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        [sortField]: order,
      },
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
