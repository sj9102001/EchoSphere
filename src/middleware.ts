import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // List of protected routes
  const protectedRoutes = ['/home', '/profile', '/user', '/chatrooms', '/chats'];
  const authPages = ['/auth/login', '/auth/signup'];

  // Retrieve the token from NextAuth
  const token = await getToken({ req: request, secret: process.env.SECRET_KEY });

  // console.log(request);
  // console.log("middleware:",token);

  // Extract pathname from request URL
  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from login/signup pages
  if (authPages.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // Redirect `/profile` to `/profile/[userId]`
  if (pathname === '/profile' && token) {
    const currentUserId = token.sub; // Assume the token contains `sub` as the user ID
    if (currentUserId) {
      return NextResponse.redirect(new URL(`/profile/${currentUserId}`, request.url));
    }
  }

  // Protect specific routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      // If no token, redirect to login page
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  

  // Protect API routes
  if (pathname.startsWith('/api/')) {
    // console.log("middleware2:",token);
    if (!token) {
      // console.log("middleware: unauthorized");
      // Return JSON response for unauthorized API access
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Allow the request to continue if conditions are met
  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    '/user/:path*',
    '/home/:path*',
    '/profile/:path*',
    '/auth/login',
    '/auth/signup',
    '/api/chatrooms',
    '/api/chat/:id*',
    '/chat/:id*',
    '/chatrooms',
    // '/api/:path*'
  ],
};
