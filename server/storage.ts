import { type Task, type InsertTask } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";

const TASKS_FILE = join(process.cwd(), "tasks.json");

export interface IStorage {
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
}

export class MemStorage implements IStorage {
  private tasks: Map<string, Task>;
  private initialized: boolean = false;

  constructor() {
    this.tasks = new Map();
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      const data = await fs.readFile(TASKS_FILE, "utf-8");
      const tasks = JSON.parse(data) as Task[];
      tasks.forEach((task) => this.tasks.set(task.id, task));
    } catch (error) {
      // File doesn't exist or is invalid, start fresh
    }
    
    this.initialized = true;
  }

  private async persist() {
    const tasks = Array.from(this.tasks.values());
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
  }

  async getAllTasks(): Promise<Task[]> {
    await this.initialize();
    return Array.from(this.tasks.values());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    await this.initialize();
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      description: insertTask.description ?? null,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    await this.persist();
    return task;
  }
}

export const storage = new MemStorage();
