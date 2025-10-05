import { type Task, type InsertTask } from "@shared/schema";
import { randomUUID } from "crypto";
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "studio-7693519829-4e97b",
  private_key_id: "72f35269809eb8df780a1a0f07dd7df2945b4a77",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzqJqwA4OFixTf\nmpY/4MiPjRR2rloy0deJQ2hbHBR2G3YfKegTNWzRjigqx1atBW4vnT9Vc8I+GVG9\ni+w5vZByfhMoUttqh/8wFYKiVuYZLF3ixTs5U23VlWrazH1PY/himKoLH1sTU3lm\nqK0Om3Z1NkMaB5CQ7pu4IuKdoAiKQqw0Llj7pu/jb41ws5LVwY0b70a2ySAQ+jKN\ngeo5TZUUvtjQ9jcSNOx0OxVwHGLJBkmpkagzVijfXMhEA0Tcd8eKzMeKzVRSf5/R\nDunlPUALoaDnzyzbHyElYFgNcZgjFcemwOMDjUuN1d41j0cdaaJT4xp6SQzUEhgn\npk5zqkZRAgMBAAECggEADioo2LVM4T0hY216/fomnfN5LaVFTR9Fz4JIypwovH92\n8pyOz2A63j0cy3NQJmVDS3jp+tOyY3aCvxTL276SJ7DAfmv6oDLXlW6GEES/2169\nNT6ofXZ84Pt+Q1Ye5XZD6bQl01QreFcwab4P95LyxemGD1nm1ZfLymViZBvvaG/D\nV0KijHxQLSGJobdlN5+1mjRJ5eMOZx9WO1JMd6s2nDAOSnd5eAOOw3k75zgnQUOZ\n7Fg0fsDhxsROTVQKOpAwMy8i50K7gu0K0Q4ZBSCmC8Th9/335tD83e9Ve491uMME\ne+MfZjUzysqrdzxkf5UgcN+V+F2OmfrcY6OxgenEZQKBgQD0USdUdBkx0H8c8FLD\nOgIkSR2YBr6oc0bI7eXNwq0/YHSnkQWGnF1X7dGEfb4VlIdxk5j8H7p9xev6OE/u\nrNwccI42RB6MPNq3DezwBJ40n8ALM+vTi7EGHhxTD88U9nxCLvo2VtqqQG8dmJ5W\n9mnRKk3HV/fNBuuobCsvP6eI1QKBgQC8P+yh449xmMKp9/kNQdYlu3fqTj4WHs04\nVeHShR4KNBkNvNptKcDEi13u+d8dOKXXvu6aGi/jHlMvsOj2JbYpXU12sDF0LWoh\nGg3pOCdacMb4xuudnBBx+W/e0FROE5BUwhEVkYev/ybrD414YlbJdEMLG3AHwr1L\nELr5wKpNtbsuED8eXUz2A==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@studio-7693519829-4e97b.iam.gserviceaccount.com",
  client_id: "100082855469210501758",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studio-7693519829-4e97b.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export interface IStorage {
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;
}

export class FirebaseStorage implements IStorage {
  async getAllTasks(): Promise<Task[]> {
    const snapshot = await db.collection('tasks').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      description: insertTask.description ?? null,
      id,
      createdAt: new Date(),
    };
    await db.collection('tasks').doc(id).set(task);
    return task;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task | null> {
    const docRef = db.collection('tasks').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Task;
  }

  async deleteTask(id: string): Promise<boolean> {
    await db.collection('tasks').doc(id).delete();
    return true;
  }
}

export const storage = new FirebaseStorage();
