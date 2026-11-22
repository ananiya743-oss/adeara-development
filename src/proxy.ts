import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      // Only require auth for /admin routes (excluding the login page itself)
      if (path === "/admin/login") return true;
      if (path.startsWith("/admin")) return Boolean(token);
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
