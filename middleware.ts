// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/sign-in(.*)", 
    "/sign-up(.*)", 
    "/reset-password(.*)", 
    "/api/generate"
  ],
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*"
  ],
};
