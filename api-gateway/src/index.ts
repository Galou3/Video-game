import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { validateToken } from "./middlewares/middleware";

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.disable('x-powered-by');

app.use(cors({
  origin: 'http://localhost:3005',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-auth-token'],
}));

app.set('trust proxy', 1);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  next();
});

const services = {
  auth: 'http://localhost:3001',
  heroes: 'http://localhost:3002',
  dungeons: 'http://localhost:3003',
  combats: 'http://localhost:3004',
};

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/auth')) {
    return next();
  }
  validateToken(req, res, next);
});

app.use('/auth', createProxyMiddleware({ target: services.auth, changeOrigin: true }));
app.use('/heroes', createProxyMiddleware({ target: services.heroes, changeOrigin: true }));
app.use('/dungeons', createProxyMiddleware({ target: services.dungeons, changeOrigin: true }));
app.use('/combats', createProxyMiddleware({ target: services.combats, changeOrigin: true }));

const API_VERSION: string = process.env.API_VERSION || 'v1';

const PORT : number = parseInt ( process.env.EXPRESS_PORT || '3000' );

app.listen ( PORT, () => {
  console.log(`[ApiGateway] Démarré sur le port ${PORT}`);
} );
