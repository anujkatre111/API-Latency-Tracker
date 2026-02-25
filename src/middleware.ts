import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
  const isRoot = req.nextUrl.pathname === "/";

  if (isAuthPage) {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.url));
    return;
  }

  if (isRoot) {
    if (isLoggedIn) return Response.redirect(new URL("/dashboard", req.url));
    return Response.redirect(new URL("/login", req.url));
  }

  if (!isLoggedIn) {
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
