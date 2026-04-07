import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(120),
  department: z.string().min(2).max(120).optional(),
  positionId: z.number().int().positive().optional(),
});

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
