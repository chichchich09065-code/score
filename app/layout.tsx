import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDevSession } from "@/lib/dev-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Score Competency Platform",
  description: "Hệ thống đánh giá khung năng lực với Next.js, Prisma và NextAuth.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = getDevSession() ?? (await auth());

  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 lg:px-6">
          <header className="mb-8 rounded-[2rem] border border-border/80 bg-white/85 px-5 py-5 shadow-[0_24px_80px_-32px_rgba(37,99,235,0.35)] backdrop-blur lg:px-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.35em] text-accent">Score</p>
                <h1 className="mt-2 text-2xl font-semibold text-deepBlue lg:text-3xl">
                  Nền tảng đánh giá khung năng lực
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Quản lý vị trí, năng lực, báo cáo đánh giá và sẵn sàng cho bước AI phân tích.
                </p>
              </div>
              <div className="flex flex-col gap-4 lg:items-end">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                  <Link
                    href="/"
                    className="rounded-full border border-transparent bg-softBlue px-4 py-2 font-medium text-accent transition hover:border-blue-200 hover:bg-white"
                  >
                    Trang chủ
                  </Link>
                  <Link
                    href="/reports/new"
                    className="rounded-full border border-border bg-white px-4 py-2 font-medium transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    Tạo đánh giá
                  </Link>
                  <Link
                    href="/reports"
                    className="rounded-full border border-border bg-white px-4 py-2 font-medium transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    Lịch sử báo cáo
                  </Link>
                  <Link
                    href="/admin"
                    className="rounded-full border border-border bg-white px-4 py-2 font-medium transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    Quản trị
                  </Link>
                </nav>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-right text-sm text-slate-700">
                  <p className="font-medium text-deepBlue">{session?.user?.name ?? "Khách"}</p>
                  <p>{session?.user?.email ?? "Chưa đăng nhập"}</p>
                </div>
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
