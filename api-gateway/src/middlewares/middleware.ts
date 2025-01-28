import { NextFunction, Request, Response } from "express";
import { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { checkAccessToken } from "../utils/util";
// import { User } from "../models/user";

export const authenticateWithAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try
    {
        const headerToken = req.headers.authorization;
        if (!headerToken)
        {
            return res.status(401).json({ errors: [{ msg: 'Unauthorized, no token provided in the header' }] });
        }
        const accessToken = headerToken.split(' ')[1];
        if (!accessToken)
        {
            return res.status(401).json({ errors: [{ msg: 'Unauthorized, no access token provided' }] });
        }
        const payload: JwtPayload = checkAccessToken(accessToken);
        req.body.userId = payload._id;
        /*
        TODO: Uncomment this block of code if we need to check if the user still exists in the database
        const userId = req.body.userId;
        const user = await User.findById(userId);
        if (!user)
        {
            return res.status(404).json({errors: [{msg: 'User not found'}]});
        }
        */
        next();
    }
    catch (error: any)
    {
        console.log(error.message);
        if (error instanceof TokenExpiredError)
        {
            return res.status(401).json({ errors: [{ msg: 'Unauthorized, access token has expired' }] });
        }
        return res.status(500).json({ errors: [{ msg: 'Server Error' }] });
    }
};

export const validateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-auth-token'] as string;

    if (!token) {
        return res.status(401).json({ error: 'Access token missing.' });
    }

    try {
        const decoded = checkAccessToken(token);

        if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
            req.body.userId = decoded.userId;
        } else {
            throw new Error('Invalid token structure: userId missing.');
        }

        next();
    } catch (error: any) {
        console.error('Token validation error:', error.message);
        res.status(403).json({ error: 'Access token invalid or expired.' });
    }
};
