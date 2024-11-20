// global.d.ts
import { NextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    user?: {
      name: string;
      email: string;
      // Add any additional user fields here
    };
  }
}
