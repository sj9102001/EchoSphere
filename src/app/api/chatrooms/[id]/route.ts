// app/api/chatrooms/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; 
import {database} from '@/config';
import { PrismaClient } from '@prisma/client';
import { update, remove, ref, set, push } from 'firebase/database';
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

    // await set(newMessageRef,firebaseMessage); // Save the message
    const messageRef = ref(database, `messages/${newMessage.id}`); // Use the Prisma ID as the key
    const firebaseMessage = {
      id: newMessage.id,
      content: message,
      senderId: senderId,
      chatRoomId: parseInt(id, 10),
      read: false, // Assuming the message is unread when sent
    };

    await set(messageRef, firebaseMessage); // Save the message in Firebase
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

// PATCH /api/chatrooms/:chatroomId/messages - Update a message
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const { messageId, editedMessage } = await req.json();

  const token = await getToken({ req, secret: process.env.SECRET_KEY });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const senderId = token.sub;

  if (!messageId || !editedMessage) {
    return NextResponse.json({ error: 'Message ID and new content are required' }, { status: 400 });
  }

  try {
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(messageId, 10) },
    });

    if (!existingMessage || existingMessage.chatRoomId !== parseInt(id, 10)) {
      return NextResponse.json({ error: 'Message not found or invalid chatroom' }, { status: 404 });
    }

    if (existingMessage.senderId.toString() !== senderId) {
      return NextResponse.json({ error: 'You are not authorized to update this message' }, { status: 403 });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(messageId, 10) },
      data: { content: editedMessage },
    });
    console.log(`Message ${messageId} updated successfully in Prisma.`);
    const messageRef = ref(database, `messages/${messageId}`);

    // Wrap the update call in try-catch for error handling
    try {
      await update(messageRef, { content: editedMessage });
      console.log(`Message ${messageId} updated successfully in Firebase.`);
    } catch (firebaseError) {
      console.error('Error updating message in Firebase:', firebaseError);
      return NextResponse.json({ error: 'Failed to update message in Firebase' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedMessage });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}


// DELETE /api/chatrooms/:chatroomId/messages - Delete a message
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const { messageId } = await req.json();

  const token = await getToken({ req, secret: process.env.SECRET_KEY });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const senderId = token.sub;

  if (!messageId) {
    return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
  }

  try {
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(messageId, 10) },
    });

    if (!existingMessage || existingMessage.chatRoomId !== parseInt(id, 10)) {
      return NextResponse.json({ error: 'Message not found or invalid chatroom' }, { status: 404 });
    }

    if (existingMessage.senderId.toString() !== senderId) {
      return NextResponse.json({ error: 'You are not authorized to delete this message' }, { status: 403 });
    }

    await prisma.message.delete({
      where: { id: parseInt(messageId, 10) },
    });

    const messageRef = ref(database, `messages/${messageId}`);
    const removeResponse = await remove(messageRef);
    console.log('Firebase remove response:', removeResponse);

    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
