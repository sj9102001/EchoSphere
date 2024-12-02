import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
export async function GET(request: NextRequest, { params }: { params: { keyword: string } }) {
  try {
    // Extract query parameters for pagination and sorting
    const { page, limit, sortBy, sortOrder } = Object.fromEntries(request.nextUrl.searchParams);

    // Extract search name from params
    const { keyword } = await params;

    // Defaults for pagination
    const pageNumber = parseInt(page || "1", 10);
    const pageSize = parseInt(limit || "10", 10);
    const skip = (pageNumber - 1) * pageSize;

    // Defaults for sorting
    const sortField = sortBy || "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    // Search condition
    const where = keyword
      ? {
          name: {
            contains: keyword,
            mode: "insensitive",
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
