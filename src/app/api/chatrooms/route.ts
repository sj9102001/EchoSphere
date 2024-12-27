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

    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        participants: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json(chatRooms, { status: 200 });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST method to create a new group chat
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, participants } = await request.json();

    if (!name || participants.length === 0) {
      return NextResponse.json({ error: 'Group name and participants are required' }, { status: 400 });
    }

    const userId = typeof token.id === 'string' ? parseInt(token.id, 10) : token.id;

    // Ensure the current user is added as a participant
    const allParticipants = [...participants, userId];

    // Create a new chat room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        participants: {
          connect: allParticipants.map((id) => ({ id })),
        },
      },
    });

    return NextResponse.json(chatRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}