/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@life/shared", "@life/ai", "@life/ui"],
  allowedDevOrigins: ["127.0.0.1"],
};
export default nextConfig;
