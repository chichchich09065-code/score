import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api";
import { runEvaluationForReport } from "@/lib/report-evaluation";

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: Context) {
  const result = await requireAdmin();

  if (result.error) {
    return result.error;
  }

  const { id } = await context.params;
  const reportId = Number(id);

  if (Number.isNaN(reportId)) {
    return NextResponse.json({ message: "Invalid report id" }, { status: 400 });
  }

  try {
    await runEvaluationForReport(reportId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "AI evaluation failed",
      },
      { status: 500 },
    );
  }
}
