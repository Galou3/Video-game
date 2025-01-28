import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter } from "./controllers/authController";
import { connectToDatabase } from "./config/database";

const app = express ();

connectToDatabase ();

app.use ( cookieParser () );
app.use ( express.urlencoded ( { extended : true } ) );
app.use ( express.json () );

app.disable ( 'x-powered-by' );
app.use ( cors () );
app.set ( 'trust proxy', 1 );

app.use ( ( req : Request, res : Response, next : NextFunction ) => {
  res.header ( 'X-Content-Type-Options', 'nosniff' );
  res.header ( 'X-Frame-Options', 'DENY' );
  next ();
} );

const API_VERSION: string = process.env.API_VERSION || 'v1';

app.use ( `/api/${API_VERSION}/auth`, authRouter );

const PORT : number = parseInt ( process.env.EXPRESS_PORT || '3001' );

app.listen ( PORT, () => {
  console.log(`[AuthService] Démarré sur le port ${PORT}`);
} );
