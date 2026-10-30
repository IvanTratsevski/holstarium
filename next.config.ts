import type { NextConfig } from "next";

// В CI задаётся BASE_PATH=/holstarium, локально переменной нет, префикс пустой
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;