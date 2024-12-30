import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const secret = process.env.SECRET_KEY;

const prisma = new PrismaClient();

interface Token {
    id: string;
}

export async function POST(request: NextRequest) {
    const token = (await getToken({ req: request, secret })) as Token | null;
    const senderId = token ? parseInt(token.id, 10) : null;
    if (!token || !senderId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 404 });
    }
    const body = await request.json();
    const receiverId = body.receiverId

    try {
        await prisma.friendRequest.create({
            data: {
                senderId: senderId,
                receiverId: receiverId
            }
        })
        return NextResponse.json({ message: "Friend request sent successfully" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error sending friend request" }, { status: 502 });
    }
}


export async function GET(request: NextRequest) {
    const token = (await getToken({ req: request, secret })) as Token | null;
    const userId = token ? parseInt(token.id, 10) : null;
    if (!userId) {
        return NextResponse.json({ error: 'ID is missing from the URL' }, { status: 400 })
    }
    try {
        const friendRequests = await prisma.friendRequest.findMany({
            where: {
                receiverId: userId,
                status: "pending"
            },
        })
        return NextResponse.json(friendRequests, { status: 200 });
    } catch (error) {
        console.log('Error fetching friend requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const token = await getToken({ req: request, secret });
    const userId = token ? token.id : null;

    if (!userId) {
        return NextResponse.json({ error: 'ID is missing from the URL' }, { status: 400 });
    }

    const body = await request.json();
    const requestId = body.id;

    try {
        // Update friend request status
        await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: 'accepted' },
        });

        const friendRequest = await prisma.friendRequest.findUnique({
            where: { id: requestId },
            include: {
                sender: true,  // Include sender data
                receiver: true  // Include receiver data
            },
        });

        if (!friendRequest) {
            return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        // Create mutual friend relationships
        await prisma.friend.create({
            data: {
                user1Id: friendRequest.senderId,
                user2Id: friendRequest.receiverId,
            },
        });

        await prisma.friend.create({
            data: {
                user1Id: friendRequest.receiverId,
                user2Id: friendRequest.senderId,
            },
        });

        // Create a new chatroom between the two users with the name as "Sender's name, Receiver's name"
        const chatRoomName = `${friendRequest.sender.name}, ${friendRequest.receiver.name}`;

        await prisma.chatRoom.create({
            data: {
                participants: {
                    connect: [
                        { id: friendRequest.senderId },
                        { id: friendRequest.receiverId },
                    ],
                },
                isGroup: false,
                name: chatRoomName,  // Set the chat room name
            },
        });

        return NextResponse.json({ message: 'Friend added successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error adding friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function DELETE(request: NextRequest) {
    const token = await getToken({ req: request, secret });
    const userId = token ? token.id : null;
    if (!userId) {
        return NextResponse.json({ error: 'ID is missing from the URL' }, { status: 400 });
    }
    const body = await request.json();
    const requestId = body.id;
    try {
        await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: "rejected" }
        })
        return NextResponse.json({ message: "Friend request rejected successfully" }, { status: 200 });
    } catch (error) {
        console.log('Error rejecting friend request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}