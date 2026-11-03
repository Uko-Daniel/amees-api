import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { adminAuthRouter } from './routes/adminAuth.js';
import { archiveFilesRouter } from './routes/archiveFiles.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://amees.com.ng',
  'https://www.amees.com.ng',
  'http://localhost:5173',
];

// Attach Socket.IO to the HTTP server
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
});

// Make `io` available in your routes via `req.app.get('io')`
app.set('io', io);

app.use(cors({ origin: allowedOrigins, credentials: false }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', publicRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/archive-files', archiveFilesRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => res.status(404).json({ error: 'API route not found' }));
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

httpServer.listen(port, () => {
  console.log(`🚀 AMEES API & WebSockets running on port ${port}`);
});