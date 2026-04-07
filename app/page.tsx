import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDevSession } from "@/lib/dev-auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = getDevSession() ?? (await auth());

  return (
    <main className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2.25rem] border border-border bg-white/90 p-8 shadow-[0_30px_90px_-40px_rgba(37,99,235,0.42)] lg:p-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-accent">Competency Intelligence</p>
          <h2 className="max-w-2xl text-4xl font-semibold leading-tight">
            Từ khung năng lực đến đánh giá nhân viên và gợi ý cải thiện trong cùng một quy trình.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Quản trị viên định nghĩa vị trí và competency. Người dùng nhập quan sát, KPI và minh
            chứng. Hệ thống lưu báo cáo để sẵn sàng cho bước AI so sánh và đề xuất kế hoạch phát triển.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reports/new"
              className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accentDark"
            >
              Tạo phiên đánh giá
            </Link>
            <Link
              href="/reports"
              className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"
            >
              Xem lịch sử báo cáo
            </Link>
            <Link
              href="/admin"
              className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"
            >
              Mở khu quản trị
            </Link>
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-blue-200 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-8 text-white shadow-[0_30px_90px_-40px_rgba(37,99,235,0.7)]">
          <h3 className="text-lg font-semibold">Quy trình sử dụng</h3>
          <ol className="mt-5 space-y-3 text-sm leading-6 text-blue-50">
            <li>1. Tạo vị trí và competency trong khu quản trị.</li>
            <li>2. Gán competency vào từng vị trí với mức yêu cầu từ 1 đến 5.</li>
            <li>3. Tạo báo cáo đánh giá cho nhân viên.</li>
            <li>4. Nhập quan sát, KPI, phản hồi và minh chứng thực tế.</li>
            <li>5. Xem chi tiết báo cáo để chuẩn bị cho bước AI đánh giá.</li>
          </ol>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_20px_60px_-38px_rgba(37,99,235,0.45)]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Quản trị</p>
          <h3 className="mt-3 text-xl font-semibold">Quản lý khung năng lực</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Tạo vị trí, competency và gán mức độ yêu cầu cho từng vai trò trong tổ chức.
          </p>
        </div>
        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_20px_60px_-38px_rgba(37,99,235,0.45)]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Người dùng</p>
          <h3 className="mt-3 text-xl font-semibold">Nhập dữ liệu đánh giá</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ghi lại quan sát, thành tích, phản hồi và tình huống thực tế của nhân viên.
          </p>
        </div>
        <div className="rounded-[2rem] border border-border bg-white/90 p-6 shadow-[0_20px_60px_-38px_rgba(37,99,235,0.45)]">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">AI</p>
          <h3 className="mt-3 text-xl font-semibold">Đối chiếu và đề xuất</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Bước tiếp theo sẽ dùng AI để đối chiếu khung năng lực với báo cáo đã nhập.
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-white/90 p-8 shadow-[0_20px_60px_-38px_rgba(37,99,235,0.45)]">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-accent">Trạng thái</p>
        <h2 className="max-w-2xl text-4xl font-semibold leading-tight">
          {session ? "Bạn đang ở chế độ sẵn sàng thao tác." : "Bạn đang ở chế độ khách."}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {session
            ? "Bạn có thể vào khu quản trị để định nghĩa khung năng lực, sau đó chuyển qua khu báo cáo để nhập đánh giá cho nhân viên."
            : "Nếu tắt chế độ bypass, người dùng sẽ đăng nhập trước khi thao tác."}
        </p>
      </section>
    </main>
  );
}
