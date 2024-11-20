// src/app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
// GET: Fetch a single post by ID
export async function GET({ params }: { params: { id: string } | undefined }) {
    if (!params || !params.id) {
      return new Response('Post ID is required', { status: 400 });
    }
  
    const { id } = params;
    console.log('Post ID:', id); // Debugging log to check the ID
  

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        user: true,  // Include the related user
        comments: true,
        likes: true
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update a post by ID
export async function PUT({ params, request }: { params: { id: string }; request: Request }) {
  const { id } = params;
  const { content, mediaUrl, visibility } = await request.json();

  if (!content && !mediaUrl && !visibility) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  try {
    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id, 10) },
      data: {
        content: content || undefined,
        mediaUrl: mediaUrl || undefined,
        visibility: visibility || undefined
      }
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Post not found or internal error' }, { status: 404 });
  }
}

// DELETE: Delete a post by ID
export async function DELETE({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const deletedPost = await prisma.post.delete({
      where: { id: parseInt(id, 10) }
    });

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Post not found or internal error' }, { status: 404 });
  }
}
