import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAdminLoginRoute = createRouteMatcher(["/admin/login"]);
const isAdminRoute = createRouteMatcher(["/admin/:path*"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authenticated = await convexAuth.isAuthenticated();

  if (isAdminLoginRoute(request)) {
    if (authenticated) {
      return nextjsMiddlewareRedirect(request, "/admin");
    }
    return;
  }

  if (isAdminRoute(request) && !authenticated) {
    return nextjsMiddlewareRedirect(request, "/admin/login");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/(api|trpc)(.*)"],
};
