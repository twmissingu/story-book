import type { Metadata } from "next";
import { Ma_Shan_Zheng, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const maShanZheng = Ma_Shan_Zheng({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const notoSans = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "小小绘本屋",
  description: "用AI为孩子们创造独一无二的绘本故事",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${maShanZheng.variable} ${notoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
