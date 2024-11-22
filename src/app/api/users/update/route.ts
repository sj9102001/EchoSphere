// File: app/api/users/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  const { id, name, bio, profilePicture, coverPhoto } = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, bio, profilePicture, coverPhoto },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
