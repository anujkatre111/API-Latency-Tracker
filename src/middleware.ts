import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAuthPage =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
  const isRoot = req.nextUrl.pathname === "/";

  // Always allow login/register to load
  if (isAuthPage) {
    if (req.auth) return Response.redirect(new URL("/dashboard", req.url));
    return;
  }

  if (isRoot) {
    if (req.auth) return Response.redirect(new URL("/dashboard", req.url));
    return Response.redirect(new URL("/login", req.url));
  }

  // Protect other routes
  if (!req.auth) {
    return Response.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/endpoints/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
