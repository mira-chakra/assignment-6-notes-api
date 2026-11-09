import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import { Note } from './models/Note.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const dbUri = process.env.MONGODB_URI;

app.use(express.json());

// Validate the full note sent to POST and PUT before saving it.
function validateNote(req, res, next) {
  const input = req.body;

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }

  const allowedFields = ['title', 'body', 'tags'];
  const unknownFields = Object.keys(input).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length > 0) {
    return res.status(400).json({ error: `Unknown field(s): ${unknownFields.join(', ')}.` });
  }

  if (typeof input.title !== 'string' || input.title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string.' });
  }
  if (input.title.trim().length > 120) {
    return res.status(400).json({ error: 'title must be 120 characters or fewer.' });
  }

  const body = input.body === undefined ? '' : input.body;
  if (typeof body !== 'string') {
    return res.status(400).json({ error: 'body must be a string.' });
  }

  const tags = input.tags === undefined ? [] : input.tags;
  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === 'string')) {
    return res.status(400).json({ error: 'tags must be an array of strings.' });
  }

  req.noteInput = {
    title: input.title.trim(),
    body,
    tags: tags.map((tag) => tag.trim()).filter(Boolean)
  };
  next();
}

function validIdOrRespond(id, res) {
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid note id.' });
    return false;
  }
  return true;
}

// GET /api/notes — list all notes (newest first).
app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id — get one note.
app.get('/api/notes/:id', async (req, res, next) => {
  try {
    if (!validIdOrRespond(req.params.id, res)) return;

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
});

// POST /api/notes — create a note.
app.post('/api/notes', validateNote, async (req, res, next) => {
  try {
    const note = await Note.create(req.noteInput);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id — replace a note's editable fields.
app.put('/api/notes/:id', validateNote, async (req, res, next) => {
  try {
    if (!validIdOrRespond(req.params.id, res)) return;

    const note = await Note.findByIdAndUpdate(req.params.id, req.noteInput, {
      new: true,
      runValidators: true
    });
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id — delete a note.
app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    if (!validIdOrRespond(req.params.id, res)) return;

    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// Return JSON for routes that do not exist.
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Handle malformed JSON and unexpected server errors in one place.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON request body.' });
  }

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function startServer() {
  if (!dbUri) {
    console.error('MONGODB_URI is missing. Create a .env file using .env.example.');
    process.exit(1);
  }

  try {
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB.');
    app.listen(port, () => {
      console.log(`Notes API is listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}

startServer();
