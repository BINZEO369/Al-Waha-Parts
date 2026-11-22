import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

function redirectLegacyLogin(request: NextRequest) {
  return NextResponse.redirect(new URL('/sign-in', request.url));
}

export default clerkConfigured
  ? clerkMiddleware((_auth, request) => {
      if (request.nextUrl.pathname === '/login') return redirectLegacyLogin(request);
    })
  : (request: NextRequest) =>
      request.nextUrl.pathname === '/login' ? redirectLegacyLogin(request) : NextResponse.next();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
