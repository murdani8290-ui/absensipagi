import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import siswaRoutes from './routes/siswa.routes.js';
import guruRoutes from './routes/guru.routes.js';
import waliRoutes from './routes/wali.routes.js';
import adminRoutes from './routes/admin.routes.js';
import absensiRoutes from './routes/absensi.routes.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

// ============ SECURITY MIDDLEWARE ============
app.use(helmet()); // Security headers

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // More strict for auth
  skipSuccessfulRequests: true,
});

app.use(limiter);

// ============ REQUEST LOGGING ============
app.use(requestLogger);

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ API ROUTES ============
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/wali', waliRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/absensi', absensiRoutes);

// ============ 404 HANDLER ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ============ ERROR HANDLER ============
app.use(errorHandler);

export default app;
