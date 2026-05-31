import { z } from "zod";

export const storyboardRequestSchema = z.object({
  brief: z.string().min(12, "Please enter at least 12 characters for the project brief."),
  audience: z.string().min(2).default("General audience"),
  scenario: z.string().min(2).default("Paid social distribution"),
  style: z.string().min(2).default("Premium, restrained, credible"),
  objective: z.string().min(2).default("Review structure first, then produce"),
  durationSeconds: z.number().int().min(6).max(60).default(20),
  aspectRatio: z.string().default("16:9"),
});

export const storyboardFrameSchema = z.object({
  id: z.string(),
  title: z.string(),
  durationSeconds: z.number().int().min(1).max(20),
  shotType: z.string(),
  goal: z.string(),
  visualPrompt: z.string(),
  voiceover: z.string(),
  onScreenText: z.string(),
  transition: z.string(),
  notes: z.string(),
});

export const storyboardCoreSchema = z.object({
  briefSummary: z.string(),
  creativeDirection: z.string(),
  reviewGuidance: z.array(z.string()).min(2).max(5),
  frames: z.array(storyboardFrameSchema).min(3).max(8),
});

export const storyboardResponseSchema = storyboardCoreSchema.extend({
  mode: z.enum(["demo", "live"]),
  provider: z.string(),
  model: z.string(),
});

export const imageRequestSchema = z.object({
  style: z.string().default("Premium, realistic, production-ready"),
  aspectRatio: z.string().default("16:9"),
  frames: z.array(storyboardFrameSchema).min(1).max(8),
});

export const generatedImageSchema = z.object({
  id: z.string(),
  title: z.string(),
  prompt: z.string(),
  url: z.string(),
  source: z.enum(["demo", "live"]),
});

export const imageGenerationResponseSchema = z.object({
  mode: z.enum(["demo", "live"]),
  provider: z.string(),
  model: z.string(),
  images: z.array(generatedImageSchema),
});

export const videoRequestSchema = z.object({
  brief: z.string().min(12),
  style: z.string().default("Premium, stable, commercial"),
  aspectRatio: z.string().default("16:9"),
  durationSeconds: z.number().int().min(4).max(20).default(8),
  frames: z.array(storyboardFrameSchema).min(1).max(8),
});

export const videoJobResponseSchema = z.object({
  mode: z.enum(["demo", "live"]),
  provider: z.string(),
  model: z.string(),
  jobId: z.string(),
  status: z.enum(["queued", "processing", "completed", "failed"]),
  pollingUrl: z.string(),
  message: z.string().optional(),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
});

export type StoryboardRequest = z.infer<typeof storyboardRequestSchema>;
export type StoryboardFrame = z.infer<typeof storyboardFrameSchema>;
export type StoryboardCore = z.infer<typeof storyboardCoreSchema>;
export type StoryboardResponse = z.infer<typeof storyboardResponseSchema>;
export type ImageRequest = z.infer<typeof imageRequestSchema>;
export type GeneratedImage = z.infer<typeof generatedImageSchema>;
export type ImageGenerationResponse = z.infer<typeof imageGenerationResponseSchema>;
export type VideoRequest = z.infer<typeof videoRequestSchema>;
export type VideoJobResponse = z.infer<typeof videoJobResponseSchema>;
