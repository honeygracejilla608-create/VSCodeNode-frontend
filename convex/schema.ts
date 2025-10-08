import { v } from "convex/values";

export default {
  documents: {
    id: v.id("documents"),
    name: v.string(),
    size: v.number(),
    contentType: v.string(),
    uploadedAt: v.string(),
    storageId: v.id("_storage"),
  },
  chats: {
    id: v.id("chats"),
    message: v.string(),
    response: v.string(),
    documentId: v.optional(v.id("documents")),
    timestamp: v.string(),
  },
  tasks: {
    id: v.id("tasks"),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    assigneeId: v.optional(v.string()),
    createdAt: v.string(),
  },
};
