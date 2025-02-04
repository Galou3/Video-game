import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { heroesRouter } from "./controllers/heroesController";
import { connectToDatabase } from "./config/database";
import { connectToRabbitMQ } from "./config/messageBroker";

const app = express();

// Security middleware
app.use(helmet());
app.disable('x-powered-by');
app.set('trust proxy', 1);

// CORS configuration
/*const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));*/
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
});
app.use(limiter);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  next();
});

// API routes
const API_VERSION: string = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/heroes`, heroesRouter);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT: number = parseInt(process.env.EXPRESS_PORT || '3002');

const startServer = async () => {
  try {
    await connectToDatabase();
    await connectToRabbitMQ();

    const server = app.listen(PORT, () => {
      console.log(`[HeroesService] Démarré sur le port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
