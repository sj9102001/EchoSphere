import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
const secret = process.env.SECRET_KEY;
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const token = await getToken({req : request, secret})
    const userId = token ? token.id : null;
    if(!userId){
        return NextResponse.json({error: 'ID is missing from the URL'},{status: 400})
    }
    try{
        const friends = await prisma.friend.findMany({
            where :{ user1Id : userId },
        });
        return NextResponse.json(friends, {status:200});
    } catch(error){
        console.error('Error fetching friends:',error);
        return NextResponse.json({error: 'Internal Server Error',status: 500 });
    }
} 