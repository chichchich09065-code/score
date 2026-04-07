import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    redirect("/admin");
  }

  async function handleLogin(formData: FormData) {
    "use server";

    try {
      await signIn("credentials", {
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirectTo: "/admin",
      });
    } catch (error) {
      if (error instanceof AuthError && error.type === "CredentialsSignin") {
        redirect("/login?error=invalid_credentials");
      }

      throw error;
    }
  }

  return (
    <main className="mx-auto max-w-xl rounded-[2rem] border border-border bg-card/90 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-[0.25em] text-accentDark">Sign In</p>
      <h2 className="mt-3 text-3xl font-semibold">Dang nhap vao he thong danh gia</h2>
      {params?.error === "invalid_credentials" ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Email hoac mat khau khong dung.
        </div>
      ) : null}
      <form action={handleLogin} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none ring-0 transition focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 outline-none ring-0 transition focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-accent px-5 py-3 font-medium text-white transition hover:bg-accentDark"
        >
          Dang nhap bang credentials
        </button>
      </form>
    </main>
  );
}
