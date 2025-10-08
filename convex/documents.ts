import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getDocuments = query({
  handler: async (ctx) => {
    return await ctx.db.query("documents").collect();
  },
});

export const uploadDocument = mutation({
  args: {
    name: v.string(),
    size: v.number(),
    contentType: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      name: args.name,
      size: args.size,
      contentType: args.contentType,
      uploadedAt: new Date().toISOString(),
      storageId: args.storageId,
    });
  },
});

export const getDocumentById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    assigneeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      assigneeId: args.assigneeId,
      createdAt: new Date().toISOString(),
    });
  },
});
