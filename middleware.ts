export { default } from "next-auth/middleware";

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/alerts/:path*", "/messages/:path*", "/events/:path*", "/market/:path*", "/village/:path*"]
};
