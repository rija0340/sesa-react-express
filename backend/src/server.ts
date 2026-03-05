import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import kilasyRoutes from './routes/kilasyRoutes.js';
import registreRoutes from './routes/registreRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import kilasyLasitraRoutes from './routes/kilasyLasitraRoutes.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/kilasy', authMiddleware, kilasyRoutes);
app.use('/api/registres', authMiddleware, registreRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/kilasy-lasitra', authMiddleware, kilasyLasitraRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend prêt sur http://localhost:${PORT}`);
});
