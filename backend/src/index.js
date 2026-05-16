import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/notesRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import insightsRoutes from './routes/insightsRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);
app.use('/shared', shareRoutes);
app.use('/insights', insightsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Peblo backend on :${PORT}`));
