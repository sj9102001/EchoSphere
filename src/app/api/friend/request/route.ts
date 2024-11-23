import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt'; 

const secret = process.env.SECRET_KEY;

const prisma = new PrismaClient();

// TODO POST: Send Friend Request From SendorID to ReceiverID
export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret });
    const senderId = token ? token.sub : null;

    if (!token || !senderId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const receiverId = body.receiverId

    try {
        await prisma.friendRequest.create({
            data: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId)
            }
        })
        return NextResponse.json({ message: "Friend request sent successfully" }, {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error sending friend request" }, {status: 502});
    }
}


// TODO GET: Fetch All Friend Request of ReceiverID
export async function GET() {
    
}

// TODO PUT: Accept Friend Request Of SendorID By ReceiverID
export async function PUT(request: NextRequest) {
    const body = await request.json();
}

// TODO DELETE: Reject Friend Request Of SendorID to ReceiverID
export async function DELETE(request: NextRequest) {
    const body = await request.json();
}