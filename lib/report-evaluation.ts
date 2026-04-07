import { evaluateReportWithAI } from "@/lib/ai-evaluation";
import { prisma } from "@/lib/prisma";

export async function runEvaluationForReport(reportId: number) {
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: "EVALUATING",
    },
  });

  try {
    const reportForEvaluation = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: {
          select: {
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
      },
    });

    if (!reportForEvaluation) {
      throw new Error("Không tìm thấy báo cáo để đánh giá.");
    }

    if (reportForEvaluation.position.positionCompetencies.length === 0) {
      throw new Error("Vị trí này chưa có competency để AI đánh giá.");
    }

    const aiResult = await evaluateReportWithAI({
      report: {
        id: reportForEvaluation.id,
        title: reportForEvaluation.title,
        content: reportForEvaluation.content,
        fileUrl: reportForEvaluation.fileUrl,
        user: reportForEvaluation.user,
        position: reportForEvaluation.position,
      },
    });

    await prisma.$transaction([
      prisma.evaluation.deleteMany({
        where: { reportId },
      }),
      prisma.report.update({
        where: { id: reportId },
        data: {
          status: "COMPLETED",
          summary: aiResult.summary,
          overallMatchPercentage: aiResult.overallMatchPercentage,
          strengths: aiResult.strengths,
          improvements: aiResult.improvements,
          evaluatedAt: new Date(),
        },
      }),
      ...aiResult.competencyResults.map((item) =>
        prisma.evaluation.create({
          data: {
            reportId,
            competencyId: item.competencyId,
            aiScore: item.aiScore,
            aiReason: item.aiReason,
            aiMatchPercentage: item.aiMatchPercentage,
          },
        }),
      ),
    ]);
  } catch (error) {
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
}
