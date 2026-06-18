/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In local dev, proxy /api/* to Go backend on port 8080
    // In production (Docker), nginx handles this
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
