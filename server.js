const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');

// Convex client
const convex = new ConvexHttpClient(process.env.CONVEX_URL);

// Database setup (Convex instead of SQLite)
const db = convex;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Storage for uploaded files (temporary, will upload to Convex)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Upload file to Convex storage
    const storageId = await convex.mutation(api.documents.uploadDocument, {
      name: file.originalname,
      size: file.size,
      contentType: file.mimetype,
      storageId: 'temp-id' // Replace with actual Convex storage upload
    });

    res.json({ message: 'File uploaded successfully', documentId: storageId });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get('/documents', async (req, res) => {
  try {
    const documents = await convex.query(api.documents.getDocuments);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/chat', async (req, res) => {
  const { message, documentId } = req.body;

  try {
    // Get document context if provided
    let documentContent = '';
    if (documentId) {
      const doc = await convex.query(api.documents.getDocumentById, { id: documentId });
      if (doc) {
        documentContent = await parseDocument(doc.path);
    }

    // Call llama.cpp with document context
    const aiResponse = await callLlamaCpp(message, documentContent);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error processing chat request:', error);
  }
});

app.post('/create-task', async (req, res) => {
  const { title, description, status, priority, assigneeId } = req.body;

  try {
    const taskId = await convex.mutation(api.documents.createTask, {
      title,
      description,
      status,
      priority,
      assigneeId,
    });
    res.json({ message: 'Task created successfully', taskId });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});
