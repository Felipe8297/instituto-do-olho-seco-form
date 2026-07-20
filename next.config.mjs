/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer precisa ser transpilado no App Router
  transpilePackages: ["@react-pdf/renderer"],
};

export default nextConfig;
