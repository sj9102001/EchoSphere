import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
import {database} from '@/config';
import { ref, set, push } from 'firebase/database';
// import { get } from 'firebase/database';
const prisma = new PrismaClient();

// interface ChatRoom {
//   id: string;
//   name: string;
//   participants: { id: number; name: string }[];
//   createdAt: string;
// }

export async function GET(request: NextRequest) {
  try {
    // const records1 = await prisma.user.findMany();
    // const records2 = await prisma.chatRoom.findMany();
    // const records3 = await prisma.message.findMany();
    // console.log(records1,records2,records3);

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
    // const chatRoomsRef = ref(database, 'chatRooms');
    // const snapshot = await get(chatRoomsRef);

    // let firebaseChatRooms: ChatRoom[] = []; // Explicitly type the variable as ChatRoom[]    if (snapshot.exists()) {
    // if (snapshot.exists()) {
    //   firebaseChatRooms = Object.values(snapshot.val());
    // }

    // // You can merge Prisma data with Firebase data here if needed
    // // For now, it returns both Prisma and Firebase chat room data separately
    // return NextResponse.json({ prismaChatRooms: chatRooms, firebaseChatRooms }, { status: 200 });
    return NextResponse.json( chatRooms , { status: 200 });
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

    const chatRoomsRef = ref(database, 'chatRooms');
    const newChatRoomRef = push(chatRoomsRef);

    // Prisma: Create a new chat room first
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name,
        participants: {
          connect: allParticipants.map((id) => ({ id })),
        },
        isGroup: true,
      },
    });

    await set(newChatRoomRef, {
      id: chatRoom.id, // Use Prisma-generated ID here
      name,
      participants: allParticipants, // Ensure this matches the Prisma model
      isGroup: true,
    });

    if(newChatRoomRef.key){
      return NextResponse.json({ id: newChatRoomRef.key, name, participants: allParticipants  }, { status: 201 });
    }
      return NextResponse.json(chatRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}