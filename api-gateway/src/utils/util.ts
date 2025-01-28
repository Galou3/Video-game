import jwt, { JwtPayload } from 'jsonwebtoken';
import { PUB_KEY } from "../config/auth.config";

export const checkAccessToken = (accessToken: string): JwtPayload => {
    try {
        return jwt.verify ( accessToken, PUB_KEY ) as JwtPayload;
    } catch ( error : any ) {
        console.log ( error.message );
        return Promise.reject ( error );
    }
};
