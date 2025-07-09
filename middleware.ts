import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

const publicPaths = ["/login", "/api/auth", "/logo.svg"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) =>pathname === "/" || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check authentication
  const token = request.cookies.get("auth-token")?.value

  if (!token || !verifyToken(token)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}
