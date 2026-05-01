import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 允许本地开发时使用本地图片
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
