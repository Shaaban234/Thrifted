/** @type {import('next').NextConfig} */
const nextConfig = {
  // Single Vercel project: this Next.js app serves the Hono API under /api AND
  // the Expo web build (a single-page app) exported into ./public at build time.
  async rewrites() {
    return {
      // afterFiles runs only for paths that didn't match a real file in /public
      // or an API route, so static assets (/_expo, /assets) are served directly
      // and every remaining route falls through to the SPA shell.
      afterFiles: [
        {
          source: "/((?!api|_expo|assets|favicon).*)",
          destination: "/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
