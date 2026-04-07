import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isAiEvaluationConfigured } from "@/lib/ai-evaluation";
import { prisma } from "@/lib/prisma";
import { runEvaluationForReport } from "@/lib/report-evaluation";

type ReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = await params;
  const reportId = Number(id);

  if (Number.isNaN(reportId)) {
    notFound();
  }

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
        },
      },
      position: {
        include: {
          positionCompetencies: {
            include: {
              competency: true,
            },
            orderBy: [{ levelRequired: "desc" }, { competency: { name: "asc" } }],
          },
        },
      },
      evaluations: {
        include: {
          competency: true,
        },
        orderBy: {
          aiMatchPercentage: "desc",
        },
      },
    },
  });

  if (!report) {
    notFound();
  }

  async function runAiEvaluation() {
    "use server";

    await runEvaluationForReport(reportId);

    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/reports");
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent">Chi tiết báo cáo</p>
            <h2 className="mt-3 text-3xl font-semibold">{report.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {report.user.name} • {report.user.email} • {report.position.name} • {report.position.department}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-right text-sm text-slate-600">
            <p>Trạng thái: {report.status}</p>
            <p>
              Đã gửi:{" "}
              {new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(report.submittedAt)}
            </p>
            <p>
              Mức phù hợp tổng thể:{" "}
              {report.overallMatchPercentage !== null ? `${report.overallMatchPercentage}%` : "Chưa có"}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={runAiEvaluation}>
            <button
              type="submit"
              disabled={!isAiEvaluationConfigured()}
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accentDark disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Đánh giá với AI
            </button>
          </form>
          <Link
            href="/reports"
            className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
          >
            Quay lại lịch sử báo cáo
          </Link>
        </div>
        {!isAiEvaluationConfigured() ? (
          <p className="mt-4 text-sm text-amber-700">
            Chưa có `OPENAI_API_KEY` trong `.env`, nên nút AI đang tạm bị khóa.
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)]">
          <h3 className="text-xl font-semibold">Nội dung đánh giá đã nhập</h3>
          <div className="mt-4 rounded-2xl bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-800">
            {report.content}
          </div>
          {report.fileUrl ? (
            <div className="mt-4">
              <a href={report.fileUrl} className="text-sm font-medium text-accent underline">
                Mở liên kết minh chứng
              </a>
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-[0_30px_90px_-40px_rgba(37,99,235,0.7)]">
          <h3 className="text-xl font-semibold">Trạng thái AI</h3>
          {report.summary ? (
            <div className="mt-4 rounded-2xl bg-white/10 px-4 py-4 text-sm leading-6 text-blue-50">
              <p className="mb-2 font-medium text-white">Tóm tắt hiện tại</p>
              <p>{report.summary}</p>
            </div>
          ) : null}
          {report.evaluations.length === 0 ? (
            <div className="mt-4 space-y-3 text-sm leading-6 text-blue-50">
              <p>Báo cáo đã được tạo và lưu thành công.</p>
              <p>Bước tiếp theo là gọi AI để so sánh báo cáo này với competency framework của vị trí.</p>
              <p>Khi đó hệ thống sẽ tạo điểm, lý do, mức phù hợp và gợi ý phát triển.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm leading-6 text-blue-50">
              <p>Báo cáo này đã có kết quả AI theo từng competency.</p>
              <p>{report.evaluations.length} competency đã được đánh giá.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)]">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold">Khung năng lực của vị trí</h3>
            <Link href="/admin" className="text-sm font-medium text-accent underline">
              Chỉnh sửa trong Quản trị
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {report.position.positionCompetencies.length === 0 ? (
              <p className="text-sm text-slate-600">Vị trí này chưa được gắn competency nào.</p>
            ) : (
              report.position.positionCompetencies.map((item) => (
                <div key={item.competencyId} className="rounded-2xl border border-border px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{item.competency.name}</p>
                      <p className="text-sm text-slate-500">{item.competency.category ?? "Chưa phân nhóm"}</p>
                      {item.competency.description ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.competency.description}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800">
                      Level {item.levelRequired}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)]">
          <h3 className="text-xl font-semibold">Kết quả đánh giá hiện có</h3>
          {Array.isArray(report.strengths) && report.strengths.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
              <p className="text-sm font-medium text-blue-900">Điểm mạnh</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                {report.strengths.map((item, index) => (
                  <li key={`${item}-${index}`}>• {String(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {Array.isArray(report.improvements) && report.improvements.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4">
              <p className="text-sm font-medium text-amber-900">Cần cải thiện</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                {report.improvements.map((item, index) => (
                  <li key={`${item}-${index}`}>• {String(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4 space-y-3">
            {report.evaluations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-sm leading-6 text-slate-600">
                Chưa có evaluation nào được tạo. Giai đoạn tiếp theo mình sẽ nối AI vào báo cáo này để
                sinh điểm theo từng competency.
              </div>
            ) : (
              report.evaluations.map((evaluation) => (
                <div key={evaluation.id} className="rounded-2xl border border-border px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{evaluation.competency.name}</p>
                      <p className="text-sm text-slate-500">{evaluation.aiMatchPercentage}% phù hợp</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800">
                      {evaluation.aiScore}/5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{evaluation.aiReason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
