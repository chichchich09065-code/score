import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      position: {
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
      _count: {
        select: {
          evaluations: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-border bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent">Lịch sử báo cáo</p>
          <h2 className="mt-3 text-3xl font-semibold">Danh sách các phiên đánh giá</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Đây là nơi người dùng và evaluator theo dõi toàn bộ báo cáo đã tạo, trạng thái và mức độ
            sẵn sàng cho bước AI đánh giá.
          </p>
        </div>
        <Link
          href="/reports/new"
          className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accentDark"
        >
          Tạo báo cáo mới
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-36px_rgba(37,99,235,0.45)]">
          <p className="text-sm text-slate-500">Tổng báo cáo</p>
          <p className="mt-2 text-4xl font-semibold">{reports.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-36px_rgba(37,99,235,0.45)]">
          <p className="text-sm text-slate-500">Đã có kết quả AI</p>
          <p className="mt-2 text-4xl font-semibold">
            {reports.filter((report) => report._count.evaluations > 0).length}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-36px_rgba(37,99,235,0.45)]">
          <p className="text-sm text-slate-500">Đang chờ đánh giá</p>
          <p className="mt-2 text-4xl font-semibold">
            {reports.filter((report) => report._count.evaluations === 0).length}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)]">
        <h3 className="text-xl font-semibold">Tất cả báo cáo</h3>
        <div className="mt-5 space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
              <p className="text-lg font-medium">Chưa có báo cáo nào.</p>
              <p className="mt-2 text-sm text-slate-600">
                Tạo báo cáo đầu tiên để người dùng có nơi nhập quan sát và minh chứng.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="block rounded-2xl border border-border bg-white px-5 py-4 transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {report.user.name} • {report.position.name} • {report.position.department}
                    </p>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      {report.content.slice(0, 220)}
                      {report.content.length > 220 ? "..." : ""}
                    </p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{report.status}</p>
                    <p>{report._count.evaluations} evaluations</p>
                    <p>
                      {new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(report.submittedAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
