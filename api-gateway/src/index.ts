import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { validateToken } from "./middlewares/middleware";

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.disable('x-powered-by');

app.use(cors());

app.set('trust proxy', 1);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Content-Security-Policy', "default-src 'self'");
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

const services = {
  auth: 'http://localhost:3001',
  heroes: 'http://localhost:3002',
  dungeons: 'http://localhost:3003',
  combats: 'http://localhost:3004',
};

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/auth-gateway')) {
    console.log('No need to validate token for auth service');
    next();
  } else {
    console.log('Validating token');
    validateToken(req, res, next);
  }
});

app.use(`/auth-gateway`, createProxyMiddleware({ target: services.auth, changeOrigin: true, proxyTimeout: 5000 }));
app.use(`/heroes-gateway`, createProxyMiddleware({ target: services.heroes, changeOrigin: true, proxyTimeout: 5000 }));
app.use(`/dungeons-gateway`, createProxyMiddleware({ target: services.dungeons, changeOrigin: true, proxyTimeout: 5000 }));
app.use(`/combats-gateway`, createProxyMiddleware({ target: services.combats, changeOrigin: true, proxyTimeout: 5000 }));

const PORT: number = parseInt(process.env.EXPRESS_PORT || '3000');

const server = app.listen(PORT, () => {
  console.log(`[ApiGateway] Démarré sur le port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
