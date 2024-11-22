import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

// GET: Fetch a single post by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // console.log(request)
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is missing from the URL' }, { status: 400 });
  }

  try {
    // const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        user: true,
        comments: true,
        likes: true,
      },
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is missing from the URL' }, { status: 400 });
  }

  const { content, mediaUrl, visibility } = await request.json();

  if (!content && !mediaUrl && !visibility) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  try {
    // Check if the user is authenticated
    // const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    // if (!token || !token.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Ensure the user is the owner of the post
    const post = await prisma.post.findUnique({ where: { id: parseInt(id, 10) } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }  

    console.log(content, mediaUrl, visibility);

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id, 10) },
      data: {
        content: content || undefined,
        mediaUrl: mediaUrl || undefined,
        visibility: visibility || undefined,
      },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

  
  // DELETE: Delete a post by ID
  export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;  // Await params to get id
    
    if (!id) {
      return NextResponse.json({ error: 'ID is missing from the URL' }, { status: 400 });
    }
  
    try {
    // const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    // if (!token || !token.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

      const deletedPost = await prisma.post.delete({
        where: { id: parseInt(id, 10) }
      });
  
      return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json({ error: 'Post not found or internal error' }, { status: 404 });
    }
  }