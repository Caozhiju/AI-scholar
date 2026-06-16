import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LingAI Scholar - 语言学AI自学平台",
  description: "面向语言学研究生的AI、计算语言学、教育NLP、大模型LLM自学平台",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex-shrink-0 h-11 border-b border-gray-100 bg-white flex items-center px-6 gap-6 z-10">
          <Link href="/" className="text-sm font-bold text-gray-800 tracking-tight hover:text-blue-600 transition-colors">
            LingAI Scholar
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              课程学习
            </Link>
            <Link
              href="/roadmap"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              培养方案
            </Link>
            <Link
              href="/graph"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              知识图谱
            </Link>
              <Link
                href="/projects"
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                科研实训
              </Link>
             <Link
                href="/audit"
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                课程审计
              </Link>
              <Link
                href="/about"
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                关于
              </Link>
          </nav>
        </header>
        <main className="flex-1 flex flex-col min-h-0">{children}</main>
      </body>
    </html>
  )
}
