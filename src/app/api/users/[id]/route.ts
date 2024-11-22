// File: app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        bio: true,
        email: true,
        profilePicture: true,
        coverPhoto: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
