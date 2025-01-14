/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt'; 
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET_KEY });
  if (!token || !token.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = typeof token.id === 'string' ? parseInt(token.id, 10) : token.id;
  const url = await new URL(req.url);  // Parse the URL from the request
  const search = url.searchParams.get('name'); // Get the 'search' parameter from the query string
  if (!search) {
    return new Response(JSON.stringify([])); // Return an empty array if no search parameter is provided
  }

  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: search, // Search users by name
        mode: 'insensitive', // Case insensitive
      },
      id: {
        not: userId, // Exclude the user with the provided userId
      },
    },
  });  

  return new Response(JSON.stringify(users));
}


export async function POST(request: NextRequest) {
  try {
    const payloadBody = await request.json();

    // Extract query parameters for pagination and sorting
    const { search, page, limit, sortBy, sortOrder, currentUserId } = payloadBody;

    // Defaults for pagination
    const pageNumber = page || 1;
    const pageSize = limit || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Defaults for sorting
    const sortField = sortBy || "name";
    const order = sortOrder === "desc" ? "asc" : "desc";

    // Fetch users with pagination, sorting, and filtering
    const users = await prisma.user.findMany({
      where: search
        ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
        : {},
      skip,
      take: pageSize,
      orderBy: {
        [sortField]: order,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    // Fetch friend requests sent by the current user
    const sentRequests = await prisma.friendRequest.findMany({
      where: { senderId: currentUserId },
      select: { receiverId: true },
    });

    // Create a set of user IDs to quickly check friend requests
    const sentRequestIds = new Set(sentRequests.map((req) => req.receiverId));

    // Add `friendRequestSent` field to each user
    const usersWithFriendRequestStatus = users.map((user) => ({
      ...user,
      friendRequestSent: sentRequestIds.has(user.id),
    }));

    // Count total users for pagination metadata
    const totalUsers = await prisma.user.count({
      where: search
        ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
        : {}
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / pageSize);

    // Create a paginated response
    const response = {
      data: usersWithFriendRequestStatus,
      meta: {
        currentPage: pageNumber,
        pageSize,
        totalUsers,
        totalPages,
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}