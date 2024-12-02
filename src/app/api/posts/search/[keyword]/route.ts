import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters for pagination, sorting, and filtering
    const { search, page, limit, sortBy, sortOrder } = Object.fromEntries(
      request.nextUrl.searchParams
    );

    // Defaults for pagination
    const pageNumber = parseInt(page || "1", 10);
    const pageSize = parseInt(limit || "10", 10);
    const skip = (pageNumber - 1) * pageSize;

    // Defaults for sorting
    const sortField = sortBy || "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    // Query filtering based on search term and visibility
    const where = {
      AND: [
        {
          visibility: {
            in: ["public", "friends-only"], // Filter for visibility
          },
        },
        search
          ? {
              OR: [
                { content: { contains: search, mode: "insensitive" } }, // Search in post content
                { user: { name: { contains: search, mode: "insensitive" } } }, // Search by user's name
              ],
            }
          : {},
      ],
    };

    // Fetch posts with pagination, sorting, and filtering
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
            profilePicture: true, // Include user details for display
          },
        },
        comments: true,
        likes: true,
      },
    });

    // Count total posts for pagination metadata
    const totalPosts = await prisma.post.count({ where });

    // Create pagination metadata
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
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
