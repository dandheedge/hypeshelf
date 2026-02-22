import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_clerk_id", ["clerkId"]),

  recommendations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    genre: v.union(
      v.literal("horror"),
      v.literal("action"),
      v.literal("comedy"),
      v.literal("thriller"),
      v.literal("sci-fi"),
      v.literal("drama"),
      v.literal("romance"),
      v.literal("documentary"),
    ),
    link: v.optional(v.string()),
    blurb: v.string(),
    isStaffPick: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_genre", ["genre"])
    .index("by_staff_pick", ["isStaffPick"]),
});
