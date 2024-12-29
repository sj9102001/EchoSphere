import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; 
import {database} from '@/config';
import { PrismaClient } from '@prisma/client';
import { ref, set, push } from 'firebase/database';
const prisma = new PrismaClient();

// GET /api/chatrooms/:chatroomId - Fetch messages for a chatroom
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const token = await getToken({ req, secret: process.env.SECRET_KEY });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chatRoomName = await prisma.chatRoom.findUnique({
      where: { id: parseInt(id, 10) },
      select: { name: true },
    });
    const messages = await prisma.message.findMany({
      where: { chatRoomId: parseInt(id, 10) },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true } }, // Include sender's name
      },
    });

    const formattedMessages = messages.map((message) => ({
      id: message.id,
      sender: message.sender.name,
      message: message.content,
      senderId: message.senderId,
    }));

    return NextResponse.json({
      chatRoomName: chatRoomName,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error('Error fetching chatroom messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/chatrooms/:chatroomId/messages - Send a new message in a chatroom
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const { message } = await req.json();

  // Extract the token from the request headers
  const token = await getToken({ req, secret: process.env.SECRET_KEY });

  // Check if the token is valid (authenticated user)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The token contains the user's ID, you can use it to identify the sender
  const senderId = token.sub; // Assuming 'sub' is the user ID in the token

  if (!message || !senderId) {
    return NextResponse.json({ error: 'Message and sender ID are required' }, { status: 400 });
  }

  try {
    const chatRoomExists = await prisma.chatRoom.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!chatRoomExists) {
      return NextResponse.json({ error: 'Chatroom not found' }, { status: 404 });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: message,
        chatRoomId: parseInt(id, 10),
        senderId: parseInt(senderId, 10), // senderId from token
      },
      include: {
        sender: { select: { name: true } },
      },
    });

    // Upload the message to Firebase Realtime Database
    const messageRef = ref(database, 'messages');
    const newMessageRef = push(messageRef);
    const firebaseMessage = {
      id: newMessage.id, // Use the Firebase generated ID
      content: message,
      senderId: senderId,
      chatRoomId: parseInt(id, 10),
      read: false, // Assuming the message is unread when sent
    };

    await set(newMessageRef,firebaseMessage); // Save the message

    return NextResponse.json({
      id: newMessage.id,
      sender: newMessage.sender.name,
      message: newMessage.content,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

