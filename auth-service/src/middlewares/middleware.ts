import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { TokenExpiredError, JwtPayload } from "jsonwebtoken";
import { checkAccessToken } from "../utils/utils";
import { User } from "../models/user";

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
        const userId = req.body.userId;
        const user = await User.findById(userId);
        if (!user)
        {
            return res.status(404).json({errors: [{msg: 'User not found'}]});
        }
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

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
