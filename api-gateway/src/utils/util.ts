import jwt, { JwtPayload } from 'jsonwebtoken';
import { PUB_KEY } from "../config/auth.config";

export const checkAccessToken = (accessToken: string): Promise<JwtPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(accessToken, PUB_KEY, { algorithms: ['RS256'] }, (error, decoded) => {
            if (error) {
                return reject(error);
            }
            resolve(decoded as JwtPayload);
        });
    });
};
