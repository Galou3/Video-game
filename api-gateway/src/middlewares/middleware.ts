    import { NextFunction, Request, Response } from "express";
    import { checkAccessToken } from "../utils/util";
    import { JwtPayload, TokenExpiredError } from "jsonwebtoken";

    export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
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
            const payload: JwtPayload = await checkAccessToken(accessToken);
            req.headers['x-user-id'] = payload._id;

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
