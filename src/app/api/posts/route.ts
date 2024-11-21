import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

// GET: Get all the posts
export async function GET(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optionally: Filter posts by user ID if needed
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        comments: true,
        likes: true,
      },
    });

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
 

// POST: Create a new post
export async function POST(request: NextRequest) {
  const { content, userId, mediaUrl, visibility } = await request.json();

  if (!content || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if the user is authenticated
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });
    if (!token || token.email !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create the post if the user is authorized
    const newPost = await prisma.post.create({
      data: {
        content,
        userId,
        mediaUrl,
        visibility,
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



// export async function GET(request: NextRequest) {
//   try {
//     // Extract query parameters for pagination, sorting, and filtering
//     const { search, page, limit, sortBy, sortOrder } = Object.fromEntries(request.nextUrl.searchParams);

//     // Defaults for pagination
//     const pageNumber = parseInt(page || '1', 10);
//     const pageSize = parseInt(limit || '10', 10);
//     const skip = (pageNumber - 1) * pageSize;

//     // Defaults for sorting
//     const sortField = sortBy || 'createdAt';
//     const order = sortOrder === 'asc' ? 'asc' : 'desc';

//     // Query filtering based on search
//     const where = search
//       ? {
//           OR: [
//             { content: { contains: search, mode: 'insensitive' } }, // Filter by content
//             { user: { name: { contains: search, mode: 'insensitive' } } }, // Filter by user's name
//           ],
//         }
//       : {};

//     // Fetch posts with pagination, sorting, and filtering
//     const posts = await prisma.post.findMany({
//       where,
//       skip,
//       take: pageSize,
//       orderBy: {
//         [sortField]: order,
//       },
//       include: {
//         user: true, // Include related user data
//         comments: true,
//         likes: true,
//       },
//     });

//     // Count total posts for pagination metadata
//     const totalPosts = await prisma.post.count({ where });

//     // Create metadata for pagination
//     const totalPages = Math.ceil(totalPosts / pageSize);

//     const response = {
//       data: posts,
//       meta: {
//         currentPage: pageNumber,
//         pageSize,
//         totalPosts,
//         totalPages,
//       },
//     };

//     return NextResponse.json(response, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching posts:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
