import { z } from "zod";

export const positionSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(5000).optional(),
  department: z.string().min(2).max(120),
});

export const competencySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(5000).optional(),
  category: z.string().max(120).optional(),
});

export const positionCompetencySchema = z.object({
  competencyId: z.number().int().positive(),
  levelRequired: z.number().int().min(1).max(5),
});
