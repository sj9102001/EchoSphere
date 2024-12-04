import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  try {
    const payloadBody = await request.json();
    // Extract query parameters for pagination and sorting
    const { search, page, limit, sortBy, sortOrder } = payloadBody;

    // Defaults for pagination
    const pageNumber = page || 1;
    const pageSize = limit || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Defaults for sorting
    const sortField = sortBy || "name";
    const order = sortOrder === "desc" ? "asc" : "desc";

    // Search condition
    const where = search
      ? {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    // Fetch users with pagination, sorting, and filtering
    const users = await prisma.user.findMany({
      where,
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

    // Count total users for pagination metadata
    const totalUsers = await prisma.user.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / pageSize);

    // Create a paginated response
    const response = {
      data: users,
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
