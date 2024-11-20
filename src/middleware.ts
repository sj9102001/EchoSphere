import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    // List of protected routes
    const protectedRoutes = ['/home', '/profile'];
    const authPages = ['/auth/login', '/auth/signup'];

    // Retrieve the token from NextAuth
    const token = await getToken({ req: request, secret: process.env.SECRET_KEY });

    // Attach the user object to the request (without the id)
    if (token && typeof token.name === 'string' && typeof token.email === 'string') {
        request.user = {
            name: token.name,
            email: token.email,
        };
    }

    // Redirect authenticated users away from login/signup pages
    if (authPages.some((route) => request.nextUrl.pathname.startsWith(route))) {
        if (token) {
            return NextResponse.redirect(new URL('/home', request.url));
        }
    }

    // Protect specific routes
    if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
        if (!token) {
            // If no token, redirect to login page
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Allow the request to continue if conditions are met
    return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
    matcher: [
        '/home/:path*',
        '/profile/:path*',
        '/auth/login',
        '/auth/signup',
    ],
};