import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { heroesRouter } from "./controllers/heroesController";
import { connectToDatabase } from "./config/database";
import { connectToRabbitMQ } from "./config/messageBroker";

const app = express ();

connectToRabbitMQ();

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

app.use ( `/api/${API_VERSION}/heroes`, heroesRouter );

const PORT : number = parseInt ( process.env.EXPRESS_PORT || '3002' );

app.listen ( PORT, () => {
  console.log(`[HeroesService] Démarré sur le port ${PORT}`);
} );
