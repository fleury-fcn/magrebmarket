/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@maghreb/config"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/media/**"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/media/**"
      }
    ]
  }
};

module.exports = nextConfig;
