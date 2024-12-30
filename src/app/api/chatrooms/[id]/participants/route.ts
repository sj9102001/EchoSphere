import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; 
import { database } from '@/config'; // Assuming Firebase DB is initialized here
import { ref, get, set, update } from 'firebase/database';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const token = await getToken({ req, secret: process.env.SECRET_KEY });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      // Fetch the chatroom data including participants and messages
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
          participants: { select: { id: true, name: true } }, // Get participants' data
        },
      });
  
      if (!chatRoom) {
        return NextResponse.json({ error: 'Chatroom not found' }, { status: 404 });
      }
  
      return NextResponse.json({
        participants: chatRoom.participants,
      });
    } catch (error) {
      console.error('Error fetching chatroom messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
  }


// POST /api/chatrooms/:chatroomId/add-participants - Add participants to chatroom
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.SECRET_KEY });
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { participants } = await req.json(); // Array of user IDs to be added
    
    // Step 1: Update Prisma
    await prisma.chatRoom.update({
      where: { id: parseInt(id, 10) },
      data: {
        participants: {
          connect: participants.map((userId: number) => ({ id: userId })),
        },
      },
    });

    // Step 2: Update Firebase
    const chatRoomRef = ref(database, `chatRooms/${id}`);
    
    // Get the current participants in Firebase chatroom
    const chatRoomSnapshot = await get(ref(database,`chatRooms/${id}`));
    const chatRoomData = chatRoomSnapshot.val();

    if (chatRoomData && chatRoomData.participants) {
      const updatedParticipants = Array.from(new Set([...chatRoomData.participants, ...participants])); // Ensure unique participants
      await update(chatRoomRef, { participants: updatedParticipants });
    } else {
      // If no participants yet, initialize with the provided ones
      await update(chatRoomRef, { participants });
    }

    return NextResponse.json({ message: 'Participants added successfully' });
  } catch (error) {
    console.error('Error adding participants:', error);
    return NextResponse.json({ error: 'Failed to add participants' }, { status: 500 });
  }
}
