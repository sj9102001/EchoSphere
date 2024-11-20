import { NextResponse } from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
// src/app/api/posts/route.ts

// GET: Fetch all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true, // You can include related data like user, comments, etc.
        comments: true,
        likes: true
      }
    });
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(req: Request) {
  const { content, userId, mediaUrl, visibility } = await req.json();

  if (!content || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        userId,
        mediaUrl,
        visibility
      }
    });
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
