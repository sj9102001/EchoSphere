import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TODO GET: Fetch All Friends
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

}