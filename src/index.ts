import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { adminAuthRouter } from './routes/adminAuth.js';
import { archiveFilesRouter } from './routes/archiveFiles.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://amees.com.ng',
  'https://www.amees.com.ng',
  'http://localhost:5173', // for local development
];

app.use(cors({
  origin: allowedOrigins,
  credentials: false, // using Bearer tokens, not cookies
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use('/api', publicRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/archive-files', archiveFilesRouter);
app.use('/api/admin', adminRouter);

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`🚀 AMEES API running at http://localhost:${port}`);
});