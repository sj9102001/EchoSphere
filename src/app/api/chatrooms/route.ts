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
      select: {
        id:true,
        isGroup:true,
        name:true,
        participants: {
          select: {
            id: true, // Only include participant IDs
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    // console.log(chatRooms);
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

    if (!name) {
      return NextResponse.json({ error: 'Group name and participants are required' }, { status: 400 });
    }

    const userId = typeof token.id === 'string' ? parseInt(token.id, 10) : token.id;
 
    // Ensure the current user is added as a participant
    const allParticipants = [...participants, userId];



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
    const chatRoomsRef = ref(database, `chatRooms/${chatRoom.id}`);

    await set(chatRoomsRef, {
      id: chatRoom.id, // Use Prisma-generated ID here
      name,
      participants: allParticipants, // Ensure this matches the Prisma model
      isGroup: true,
    });

    if(chatRoomsRef.key){
      return NextResponse.json({ id: chatRoomsRef.key, name, participants: allParticipants  }, { status: 201 });
    }
      return NextResponse.json(chatRoom, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function PATCH(request: NextRequest) {
  try {
    // Get token for user authentication
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name } = await request.json();

    // Validate the input data
    if (!id || !name) {
      return NextResponse.json({ error: 'Chatroom ID and new name are required' }, { status: 400 });
    }

    const userId = typeof token.id === 'string' ? parseInt(token.id, 10) : token.id;

    // Check if the chatroom exists and the user is part of it
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!chatRoom) {
      return NextResponse.json({ error: 'Chatroom not found' }, { status: 404 });
    }

    // Ensure the current user is part of the chatroom
    const isUserParticipant = chatRoom.participants.some((participant) => participant.id == userId);
    if (!isUserParticipant) {
      return NextResponse.json({ error: 'You are not a participant of this chatroom' }, { status: 403 });
    }

    // Update chatroom in Prisma
    const updatedChatRoom = await prisma.chatRoom.update({
      where: { id },
      data: { name },
    });

    // Update chatroom name in Firebase
    const chatRoomRef = ref(database, `chatRooms/${id}`);
    await set(chatRoomRef, {
      id,
      name,
      participants: chatRoom.participants.map((participant) => participant.id),
      isGroup: chatRoom.isGroup, // Retain the 'isGroup' status if needed
    });

    return NextResponse.json(updatedChatRoom, { status: 200 });
  } catch (error) {
    console.error('Error updating chat room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Chatroom ID is required' }, { status: 400 });
    }

    const userId = typeof token.id === 'string' ? parseInt(token.id, 10) : token.id;

    // Check if the chatroom exists and the user is part of it
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!chatRoom) {
      return NextResponse.json({ error: 'Chatroom not found' }, { status: 404 });
    }

    // Ensure the current user is part of the chatroom
    const isUserParticipant = chatRoom.participants.some((participant) => participant.id == userId);
    if (!isUserParticipant) {
      return NextResponse.json({ error: 'You are not a participant of this chatroom' }, { status: 403 });
    }

    // Remove the user from the participants list in Prisma
    const updatedChatRoom = await prisma.chatRoom.update({
      where: { id },
      data: {
        participants: {
          set: chatRoom.participants.filter(participant => participant.id !== userId),  // Remove the user with the given userId
        },
      },
      include: { participants: true },
    });
    

    // Update the chat room in Firebase
    const chatRoomRef = ref(database, `chatRooms/${id}`);
    await set(chatRoomRef, {
      id,
      name: chatRoom.name,
      participants: updatedChatRoom.participants.map((participant) => participant.id),
      isGroup: chatRoom.isGroup,
    });

    return NextResponse.json(updatedChatRoom, { status: 200 });
  } catch (error) {
    console.error('Error removing user from chat room:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
