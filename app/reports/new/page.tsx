import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function NewReportPage() {
  async function createReport(formData: FormData) {
    "use server";

    const userId = Number(formData.get("userId"));
    const positionId = Number(formData.get("positionId"));
    const title = String(formData.get("title") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const fileUrl = String(formData.get("fileUrl") ?? "").trim() || undefined;

    if (Number.isNaN(userId) || Number.isNaN(positionId) || !title || !content) {
      throw new Error("Du lieu report khong hop le.");
    }

    const report = await prisma.report.create({
      data: {
        userId,
        positionId,
        title,
        content,
        fileUrl,
        status: "SUBMITTED",
      },
      select: {
        id: true,
      },
    });

    revalidatePath("/reports");
    revalidatePath("/admin");
    redirect(`/reports/${report.id}`);
  }

  const [users, positions] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        positionId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.position.findMany({
      include: {
        positionCompetencies: {
          include: {
            competency: true,
          },
          orderBy: [{ levelRequired: "desc" }, { competency: { name: "asc" } }],
        },
      },
      orderBy: [{ department: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <main className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] border border-border bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)]">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent">Đánh giá mới</p>
        <h2 className="mt-3 text-3xl font-semibold">Nhập dữ liệu đánh giá cho nhân viên</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          Đây là giao diện cho người dùng hoặc evaluator ghi lại quan sát thực tế. Bước AI sẽ dựa
          trên nội dung này và competency framework để đánh giá mức độ phù hợp.
        </p>

        <form action={createReport} className="mt-8 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="userId" className="mb-2 block text-sm font-medium">
                Nhân viên được đánh giá
              </label>
              <select
                id="userId"
                name="userId"
                className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Chọn nhân viên
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="positionId" className="mb-2 block text-sm font-medium">
                Vị trí đối chiếu
              </label>
              <select
                id="positionId"
                name="positionId"
                className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
                required
                defaultValue=""
              >
                <option value="" disabled>
                  Chọn vị trí
                </option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name} - {position.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-medium">
              Tiêu đề đánh giá
            </label>
            <input
              id="title"
              name="title"
              placeholder="Ví dụ: Đánh giá quý II / review sau thử việc / performance snapshot"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium">
              Quan sát, KPI, phản hồi, tình huống thực tế
            </label>
            <textarea
              id="content"
              name="content"
              rows={14}
              placeholder="Nhập dữ liệu thực tế về nhân viên: kết quả công việc, phản hồi từ quản lý, mức độ chủ động, tình huống đã xử lý, KPI, bằng chứng hành vi..."
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
              required
            />
          </div>

          <div>
            <label htmlFor="fileUrl" className="mb-2 block text-sm font-medium">
              Tệp hoặc liên kết minh chứng
            </label>
            <input
              id="fileUrl"
              name="fileUrl"
              placeholder="https://... hoặc đường dẫn tệp"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-accent px-5 py-3 font-medium text-white transition hover:bg-accentDark"
          >
            Tạo báo cáo đánh giá
          </button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-blue-200 bg-gradient-to-br from-blue-600 to-cyan-500 p-7 text-white shadow-[0_30px_90px_-40px_rgba(37,99,235,0.7)]">
          <h3 className="text-xl font-semibold">Luồng người dùng</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-blue-50">
            <li>1. Chọn nhân viên và vị trí cần đối chiếu.</li>
            <li>2. Nhập dữ liệu minh chứng càng cụ thể càng tốt.</li>
            <li>3. Tạo báo cáo để lưu vào hệ thống.</li>
            <li>4. Mở báo cáo chi tiết để xem competency framework liên quan.</li>
          </ul>
        </div>

        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)]">
          <h3 className="text-xl font-semibold">Vị trí hiện có</h3>
          <div className="mt-4 space-y-4">
            {positions.length === 0 ? (
              <p className="text-sm text-slate-600">Chưa có vị trí nào. Vào Quản trị để tạo trước.</p>
            ) : (
              positions.map((position) => (
                <div key={position.id} className="rounded-2xl border border-border px-4 py-4">
                  <p className="font-medium">
                    {position.name} - {position.department}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {position.positionCompetencies.length === 0 ? (
                      <p className="text-sm text-slate-500">Chưa có competency được gắn.</p>
                    ) : (
                      position.positionCompetencies.map((item) => (
                        <span
                          key={item.competencyId}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm text-blue-800"
                        >
                          {item.competency.name} - L{item.levelRequired}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
