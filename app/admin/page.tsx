import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDevSession } from "@/lib/dev-auth";
import { prisma } from "@/lib/prisma";
import { competencySchema, positionCompetencySchema, positionSchema } from "@/lib/validators";

async function requireAdminSession() {
  "use server";

  const session = getDevSession() ?? (await auth());

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return session;
}

export default async function AdminPage() {
  const session = await requireAdminSession();

  async function createPosition(formData: FormData) {
    "use server";

    await requireAdminSession();

    const parsed = positionSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      department: String(formData.get("department") ?? ""),
      description: String(formData.get("description") ?? "").trim() || undefined,
    });

    if (!parsed.success) {
      throw new Error("Thong tin vi tri khong hop le.");
    }

    await prisma.position.create({
      data: parsed.data,
    });

    revalidatePath("/admin");
  }

  async function createCompetency(formData: FormData) {
    "use server";

    await requireAdminSession();

    const parsed = competencySchema.safeParse({
      name: String(formData.get("name") ?? ""),
      category: String(formData.get("category") ?? "").trim() || undefined,
      description: String(formData.get("description") ?? "").trim() || undefined,
    });

    if (!parsed.success) {
      throw new Error("Thong tin competency khong hop le.");
    }

    await prisma.competency.create({
      data: parsed.data,
    });

    revalidatePath("/admin");
  }

  async function linkCompetencyToPosition(formData: FormData) {
    "use server";

    await requireAdminSession();

    const parsed = positionCompetencySchema.safeParse({
      competencyId: Number(formData.get("competencyId")),
      levelRequired: Number(formData.get("levelRequired")),
    });
    const positionId = Number(formData.get("positionId"));

    if (Number.isNaN(positionId) || !parsed.success) {
      throw new Error("Du lieu khung nang luc khong hop le.");
    }

    await prisma.positionCompetency.upsert({
      where: {
        positionId_competencyId: {
          positionId,
          competencyId: parsed.data.competencyId,
        },
      },
      update: {
        levelRequired: parsed.data.levelRequired,
      },
      create: {
        positionId,
        competencyId: parsed.data.competencyId,
        levelRequired: parsed.data.levelRequired,
      },
    });

    revalidatePath("/admin");
  }

  const [positions, competencies, users] = await Promise.all([
    prisma.position.findMany({
      include: {
        positionCompetencies: {
          include: {
            competency: true,
          },
          orderBy: [{ levelRequired: "desc" }, { competency: { name: "asc" } }],
        },
        _count: {
          select: {
            users: true,
            reports: true,
            positionCompetencies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.competency.findMany({
      include: {
        _count: {
          select: {
            evaluations: true,
            positionCompetencies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-border bg-white/90 px-6 py-6 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.45)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-accent">Không gian quản trị</p>
          <h2 className="mt-2 text-2xl font-semibold text-deepBlue">Thiết kế khung năng lực theo vị trí</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tạo vị trí, tạo competency và ghép chúng lại thành bộ tiêu chuẩn đánh giá.
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
          <p>{session.user.name}</p>
          <p>{session.user.role}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-36px_rgba(37,99,235,0.45)]">
          <p className="text-sm text-slate-500">Vị trí</p>
          <p className="mt-2 text-4xl font-semibold">{positions.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-36px_rgba(37,99,235,0.45)]">
          <p className="text-sm text-slate-500">Năng lực</p>
          <p className="mt-2 text-4xl font-semibold">{competencies.length}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-white/90 p-6 shadow-[0_18px_50px_-36px_rgba(37,99,235,0.45)]">
          <p className="text-sm text-slate-500">Người dùng</p>
          <p className="mt-2 text-4xl font-semibold">{users.length}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <form action={createPosition} className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-42px_rgba(37,99,235,0.45)]">
          <h3 className="text-xl font-semibold">Tạo vị trí</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Nhập tên vị trí và phòng ban trước, sau đó gắn các competency vào vị trí này.
          </p>
          <div className="mt-6 space-y-4">
            <input
              name="name"
              placeholder="Tên vị trí, ví dụ: Senior Backend Engineer"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
              required
            />
            <input
              name="department"
              placeholder="Phòng ban, ví dụ: Engineering"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
              required
            />
            <textarea
              name="description"
              placeholder="Mô tả ngắn cho vị trí này..."
              rows={5}
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-accent px-5 py-3 font-medium text-white transition hover:bg-accentDark"
            >
              Lưu vị trí
            </button>
          </div>
        </form>

        <form
          action={createCompetency}
          className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-42px_rgba(37,99,235,0.45)]"
        >
          <h3 className="text-xl font-semibold">Tạo competency</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Mỗi competency nên là một năng lực có thể đánh giá rõ ràng và gắn được cho nhiều vị trí.
          </p>
          <div className="mt-6 space-y-4">
            <input
              name="name"
              placeholder="Tên competency, ví dụ: System Design"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
              required
            />
            <input
              name="category"
              placeholder="Nhóm, ví dụ: Technical / Leadership"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
            />
            <textarea
              name="description"
              placeholder="Mô tả competency và hành vi kỳ vọng..."
              rows={5}
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-deepBlue px-5 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              Lưu competency
            </button>
          </div>
        </form>

        <form
          action={linkCompetencyToPosition}
          className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-42px_rgba(37,99,235,0.45)]"
        >
          <h3 className="text-xl font-semibold">Gắn competency vào vị trí</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Chọn vị trí, competency và mức độ yêu cầu từ 1 đến 5 để tạo khung năng lực.
          </p>
          <div className="mt-6 space-y-4">
            <select
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
            <select
              name="competencyId"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Chọn competency
              </option>
              {competencies.map((competency) => (
                <option key={competency.id} value={competency.id}>
                  {competency.name}
                  {competency.category ? ` - ${competency.category}` : ""}
                </option>
              ))}
            </select>
            <select
              name="levelRequired"
              className="w-full rounded-2xl border border-border bg-slate-50 px-4 py-3 outline-none transition focus:border-accent"
              required
              defaultValue="3"
            >
              <option value="1">Level 1 - Cơ bản</option>
              <option value="2">Level 2 - Làm được với hỗ trợ</option>
              <option value="3">Level 3 - Độc lập</option>
              <option value="4">Level 4 - Vững vàng</option>
              <option value="5">Level 5 - Dẫn dắt / Chuyên gia</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-2xl bg-accent px-5 py-3 font-medium text-white transition hover:bg-accentDark"
            >
              Thêm vào khung năng lực
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-42px_rgba(37,99,235,0.45)]">
          <h2 className="text-xl font-semibold">Vị trí</h2>
          <div className="mt-4 space-y-4">
            {positions.length === 0 ? (
              <p className="text-sm text-slate-600">Chưa có vị trí nào trong cơ sở dữ liệu.</p>
            ) : (
              positions.map((position) => (
                <div key={position.id} className="rounded-2xl border border-border px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{position.name}</p>
                      <p className="text-sm text-slate-500">{position.department}</p>
                      {position.description ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{position.description}</p>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-500">
                      {position._count.positionCompetencies} competencies
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {position.positionCompetencies.length === 0 ? (
                      <p className="text-sm text-slate-500">Chưa gắn competency nào cho vị trí này.</p>
                    ) : (
                      position.positionCompetencies.map((item) => (
                        <span
                          key={item.competencyId}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm text-blue-800"
                        >
                          {item.competency.name} - Level {item.levelRequired}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_24px_80px_-42px_rgba(37,99,235,0.45)]">
          <h2 className="text-xl font-semibold">Năng lực</h2>
          <div className="mt-4 space-y-3">
            {competencies.length === 0 ? (
              <p className="text-sm text-slate-600">Chưa có competency nào trong cơ sở dữ liệu.</p>
            ) : (
              competencies.map((competency) => (
                <div key={competency.id} className="rounded-2xl border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{competency.name}</p>
                      <p className="text-sm text-slate-500">{competency.category ?? "Chưa phân nhóm"}</p>
                      {competency.description ? (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{competency.description}</p>
                      ) : null}
                    </div>
                    <p className="text-sm text-slate-500">
                      {competency._count.positionCompetencies} linked
                    </p>
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
