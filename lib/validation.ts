import { z } from "zod";
import { RANKING_CATEGORIES, SATIRE_CATEGORIES } from "@/lib/types";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const playerSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes"),
  role: z.enum(["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"]),
  battingStyle: z.string().max(50).optional().or(z.literal("")),
  bowlingStyle: z.string().max(50).optional().or(z.literal("")),
  team: z.string().min(2).max(60).default("Nepal"),
  bio: z.string().max(2000).optional().or(z.literal("")),
  memeScore: z.coerce.number().int().min(0).max(100).default(50),
  fanScore: z.coerce.number().int().min(0).max(100).default(50),
  trending: z.coerce.boolean().default(false),
  currentForm: z.string().max(200).optional().or(z.literal("")),
});

export const satirePostSchema = z.object({
  title: z.string().min(5, "Title is too short").max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes"),
  content: z.string().min(20, "Give the satire a little more body").max(20000),
  excerpt: z.string().max(400).optional().or(z.literal("")),
  category: z.enum(SATIRE_CATEGORIES),
  playerId: z.string().max(64).optional().or(z.literal("")),
  status: z.enum(["draft", "pending", "published", "rejected"]),
  featured: z.coerce.boolean().default(false),
});

export const memeSubmissionSchema = z.object({
  title: z.string().min(3, "Give your meme a title").max(150),
  submittedBy: z.string().min(2, "Tell us who you are").max(60),
  playerId: z.string().max(64).optional().or(z.literal("")),
});

export const fanReactionSchema = z.object({
  username: z.string().min(2, "Name is too short").max(60),
  reaction: z
    .string()
    .min(3, "Say a little more than that")
    .max(500, "Keep it under 500 characters"),
  playerId: z.string().max(64).optional().or(z.literal("")),
  postId: z.string().max(64).optional().or(z.literal("")),
});

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const rankingSchema = z.object({
  title: z.string().min(3).max(150),
  category: z.enum(RANKING_CATEGORIES),
  playerId: z.string().min(1, "Pick a player"),
  score: z.coerce.number().min(0).max(1000),
  reason: z.string().max(300).optional().or(z.literal("")),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Use YYYY-MM"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PlayerInput = z.infer<typeof playerSchema>;
export type SatirePostInput = z.infer<typeof satirePostSchema>;
export type FanReactionInput = z.infer<typeof fanReactionSchema>;
