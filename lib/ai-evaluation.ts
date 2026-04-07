import { z } from "zod";

const competencyResultSchema = z.object({
  competencyId: z.number().int().positive(),
  aiScore: z.number().int().min(1).max(5),
  aiMatchPercentage: z.number().min(0).max(100),
  aiReason: z.string().min(1),
});

const evaluationOutputSchema = z.object({
  overallMatchPercentage: z.number().min(0).max(100),
  strengths: z.array(z.string().min(1)).max(8),
  improvements: z.array(z.string().min(1)).max(8),
  summary: z.string().min(1),
  competencyResults: z.array(competencyResultSchema).min(1),
});

export type EvaluationOutput = z.infer<typeof evaluationOutputSchema>;

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-flash-lite-latest";

  return {
    apiKey,
    model,
  };
}

type EvaluationContext = {
  report: {
    id: number;
    title: string;
    content: string;
    fileUrl: string | null;
    user: {
      name: string;
      email: string;
      department: string | null;
    };
    position: {
      name: string;
      department: string;
      description: string | null;
      positionCompetencies: Array<{
        competencyId: number;
        levelRequired: number;
        competency: {
          id: number;
          name: string;
          category: string | null;
          description: string | null;
        };
      }>;
    };
  };
};

function buildEvaluationPrompt(context: EvaluationContext) {
  const competencies = context.report.position.positionCompetencies
    .map((item) => {
      const description = item.competency.description
        ? `Mô tả: ${item.competency.description}`
        : "Mô tả: chưa có.";
      const category = item.competency.category
        ? `Nhóm: ${item.competency.category}.`
        : "Nhóm: chưa phân loại.";

      return [
        `- competencyId: ${item.competency.id}`,
        `Tên năng lực: ${item.competency.name}`,
        category,
        `Mức yêu cầu: ${item.levelRequired}/5`,
        description,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "Bạn là chuyên gia đánh giá năng lực nhân sự nội bộ.",
    "Hãy đọc báo cáo thực tế của nhân viên và đối chiếu với khung năng lực của vị trí.",
    "Chỉ dùng dữ kiện có trong báo cáo.",
    "Nếu thiếu dữ liệu, hãy nêu rõ trong phần lý do.",
    "Trả kết quả bằng tiếng Việt, ngắn gọn nhưng cụ thể.",
    "aiScore là từ 1 đến 5.",
    "aiMatchPercentage là từ 0 đến 100.",
    "overallMatchPercentage là mức phù hợp tổng thể.",
    "competencyResults phải có đúng một phần tử cho mỗi competency trong danh sách.",
    "",
    `Nhân viên: ${context.report.user.name} (${context.report.user.email})`,
    `Phòng ban: ${context.report.user.department ?? "Chưa có"}`,
    `Vị trí đối chiếu: ${context.report.position.name} - ${context.report.position.department}`,
    `Mô tả vị trí: ${context.report.position.description ?? "Chưa có"}`,
    `Tiêu đề báo cáo: ${context.report.title}`,
    `Minh chứng / liên kết: ${context.report.fileUrl ?? "Không có"}`,
    "",
    "Nội dung báo cáo thực tế:",
    context.report.content,
    "",
    "Khung năng lực của vị trí:",
    competencies,
  ].join("\n");
}

function extractGeminiText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    text?: string;
    candidates?: Array<{
      content?: {
        parts?: Array<{
          text?: string;
        }>;
      };
    }>;
  };

  if (typeof candidate.text === "string" && candidate.text.trim()) {
    return candidate.text;
  }

  const text =
    candidate.candidates?.[0]?.content?.parts
      ?.map((part) => part.text?.trim())
      .filter(Boolean)
      .join("\n") ?? null;

  return text && text.length > 0 ? text : null;
}

function normalizeGeminiModelName(model: string) {
  const trimmed = model.trim();

  if (!trimmed) {
    return "gemini-flash-lite-latest";
  }

  if (trimmed.includes(" ")) {
    const lower = trimmed.toLowerCase();

    if (lower === "gemini 3.1 flash lite") {
      return "gemini-flash-lite-latest";
    }
  }

  return trimmed;
}

export function isAiEvaluationConfigured() {
  return Boolean(getGeminiConfig().apiKey);
}

export async function evaluateReportWithAI(context: EvaluationContext): Promise<EvaluationOutput> {
  const { apiKey, model: configuredModel } = getGeminiConfig();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY chưa được cấu hình.");
  }

  const model = normalizeGeminiModelName(configuredModel);
  const prompt = buildEvaluationPrompt(context);

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          overallMatchPercentage: {
            type: "number",
            description: "Mức phù hợp tổng thể từ 0 đến 100.",
          },
          strengths: {
            type: "array",
            items: { type: "string" },
            description: "Danh sách điểm mạnh nổi bật.",
          },
          improvements: {
            type: "array",
            items: { type: "string" },
            description: "Danh sách ưu tiên cải thiện.",
          },
          summary: {
            type: "string",
            description: "Tóm tắt ngắn gọn bằng tiếng Việt.",
          },
          competencyResults: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                competencyId: {
                  type: "integer",
                  description: "ID competency từ danh sách đầu vào.",
                },
                aiScore: {
                  type: "integer",
                  description: "Điểm năng lực từ 1 đến 5.",
                },
                aiMatchPercentage: {
                  type: "number",
                  description: "Mức phù hợp từ 0 đến 100.",
                },
                aiReason: {
                  type: "string",
                  description: "Giải thích ngắn gọn dựa trên bằng chứng trong báo cáo.",
                },
              },
              required: ["competencyId", "aiScore", "aiMatchPercentage", "aiReason"],
            },
          },
        },
        required: ["overallMatchPercentage", "strengths", "improvements", "summary", "competencyResults"],
      },
    },
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  let response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok && configuredModel !== "gemini-flash-lite-latest" && model !== "gemini-flash-lite-latest") {
    response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      },
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  const text = extractGeminiText(payload);

  if (!text) {
    throw new Error("Gemini không trả về nội dung đánh giá hợp lệ.");
  }

  const parsedJson = JSON.parse(text);
  return evaluationOutputSchema.parse(parsedJson);
}
