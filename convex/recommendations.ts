import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    genre: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let recommendations;

    if (args.genre) {
      recommendations = await ctx.db
        .query("recommendations")
        .withIndex("by_genre")
        .filter((q) =>
          q.eq(
            q.field("genre"),
            args.genre as
              | "horror"
              | "action"
              | "comedy"
              | "thriller"
              | "sci-fi"
              | "drama"
              | "romance"
              | "documentary",
          ),
        )
        .order("desc")
        .take(50);
    } else {
      recommendations = await ctx.db
        .query("recommendations")
        .order("desc")
        .take(50);
    }

    // Get current user for auth context
    const identity = await ctx.auth.getUserIdentity();
    let currentUser = null;
    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
    }

    // Batch fetch all unique users to avoid N+1
    const uniqueUserIds = [...new Set(recommendations.map((rec) => rec.userId))];
    const users = await Promise.all(
      uniqueUserIds.map((userId) => ctx.db.get(userId))
    );
    const userMap = new Map(
      users.filter((u): u is NonNullable<typeof u> => u !== null).map((u) => [u._id, u])
    );

    return recommendations.map((rec) => {
      const user = userMap.get(rec.userId);
      return {
        ...rec,
        userName: user?.name ?? "Unknown",
        userImageUrl: user?.imageUrl,
        // Include auth context for UI
        currentUserRole: currentUser?.role,
        isOwner: currentUser ? rec.userId === currentUser._id : false,
      };
    });
  },
});

export const listByUser = query({
  args: {
    genre: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const isAdmin = user.role === "admin";
    let recommendations;

    if (args.genre) {
      if (isAdmin) {
        // Admin: get all recommendations filtered by genre
        recommendations = await ctx.db
          .query("recommendations")
          .withIndex("by_genre")
          .filter((q) => q.eq(q.field("genre"), args.genre as any))
          .order("desc")
          .take(50);
      } else {
        // User: get only their recommendations filtered by genre
        recommendations = await ctx.db
          .query("recommendations")
          .withIndex("by_user")
          .filter((q) =>
            q.and(
              q.eq(q.field("genre"), args.genre as any),
              q.eq(q.field("userId"), user._id),
            ),
          )
          .order("desc")
          .take(50);
      }
    } else {
      if (isAdmin) {
        // Admin: get all recommendations
        recommendations = await ctx.db
          .query("recommendations")
          .order("desc")
          .take(50);
      } else {
        // User: get only their recommendations
        recommendations = await ctx.db
          .query("recommendations")
          .withIndex("by_user")
          .filter((q) => q.eq(q.field("userId"), user._id))
          .order("desc")
          .take(50);
      }
    }

    // Batch fetch all unique users to avoid N+1
    const uniqueUserIds = [...new Set(recommendations.map((rec) => rec.userId))];
    const users = await Promise.all(
      uniqueUserIds.map((userId) => ctx.db.get(userId))
    );
    const userMap = new Map(
      users.filter((u): u is NonNullable<typeof u> => u !== null).map((u) => [u._id, u])
    );

    return recommendations.map((rec) => {
      const recUser = userMap.get(rec.userId);
      return {
        ...rec,
        userName: recUser?.name ?? "Unknown",
        userImageUrl: recUser?.imageUrl,
        // Include current user's role for UI checks
        currentUserRole: user.role,
        // Include whether this is the current user's recommendation
        isOwner: rec.userId === user._id,
      };
    });
  },
});

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Unauthenticated: must be signed in to add a recommendation",
      );
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("recommendations", {
      ...args,
      userId: user._id,
      isStaffPick: false,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const rec = await ctx.db.get(id);
    if (!rec) throw new Error("Recommendation not found");

    if (user.role !== "admin" && rec.userId !== user._id) {
      throw new Error("Forbidden: insufficient permissions");
    }

    await ctx.db.delete(id);
  },
});

export const markAsStaffPick = mutation({
  args: { id: v.id("recommendations") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Forbidden: admin only");
    }

    await ctx.db.patch(id, { isStaffPick: true });
  },
});
