import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt'; 

const secret = process.env.SECRET_KEY;

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret });
    const senderId = token ? token.id : null;

    if (!token || !senderId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        return NextResponse.json({ message: "Friend request sent successfully" }, {status: 200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error sending friend request" }, {status: 502});
    }
}


export async function GET(request: NextRequest) {
    const token = await getToken({req:request, secret});
    const userId = token ? token.id : null;
    if(!userId){
        return NextResponse.json({error: 'ID is missing from the URL'},{status: 400})
    }
    try{
        const friendRequests = await prisma.friendRequest.findMany({
            where : {
                receivedId: userId,
                status: "pending"
            },
        })
        return NextResponse.json(friendRequests, {status: 200});
    } catch(error){
        console.log('Error fetching friend requests:', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}

export async function PUT(request: NextRequest) {
    // accept friend request
    const token = await getToken({req:request, secret});
    const userId = token ? token.id : null;
    if(!userId){
        return NextResponse.json({error: 'ID is missing from the URL'},{status: 400});
    }
    // get requestID from request body
    const body = await request.json();
    const requestId = body.id;
    try{
        await prisma.friendRequest.update({
            where : { id : requestId},
            data : {status : "accepted"}
        })
        const friendRequest = await prisma.friendRequest.findUnique({
            where : { id : requestId}
        })
        await prisma.friend.create({
            data : {
                userId : parseInt(friendRequest.senderId),
                friendId : parseInt(friendRequest.receiverId)
            }
        })
        await prisma.friend.create({
            data : {
                userId : parseInt(friendRequest.receiverId),
                friendId : parseInt(friendRequest.senderId)
            }
        })
        return NextResponse.json({message: "Friend added successfully"}, {status: 200});
    } catch(error){
        console.log('Error adding friend:', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}
export async function DELETE(request: NextRequest) {
    const token = await getToken({req:request, secret});
    const userId = token ? token.id : null;
    if(!userId){
        return NextResponse.json({error: 'ID is missing from the URL'},{status: 400});
    }
    const body = await request.json();
    const requestId = body.id;
    try{
        await prisma.friendRequest.update({
            where : { id : requestId},
            data : {status : "rejected"}
        })
        return NextResponse.json({message: "Friend request rejected successfully"}, {status: 200});
    } catch(error){
        console.log('Error rejecting friend request:', error);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}