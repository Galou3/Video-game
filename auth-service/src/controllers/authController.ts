import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { hashPassword, comparePassword, generateTokens, refreshAccessToken } from "../utils/util";
import { validateRequest } from '../middlewares/middleware';
import { User } from '../models/user';
import { loginValidation } from "../validations/authenticationValidations";
import { userRegistrationValidation } from "../validations/userValidations";
import { UserRefreshToken } from "../models/userRefreshToken";

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'myJwtSecret';

// @route   POST /register
// @desc    Register user
// @access  Public
router.post('/register',
    [
        ...userRegistrationValidation
    ],
    async (req : Request, res : Response) : Promise<any> => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: 'Cet utilisateur existe déjà.' });
        }

        const hash = await hashPassword(password);
        const newUser = new User({ username, hash });
        await newUser.save();

        res.status(201).json({ message: 'Utilisateur créé avec succès.' });
    } catch (err) {
        console.error('Erreur /register:', err);
        res.status(500).json({ error: 'Erreur lors de la création du compte.' });
    }
});

// @route   POST /login
// @desc    Login user
// @access  Public
router.post('/login',
    [
        ...loginValidation
    ],  validateRequest,
    async ( req: Request, res: Response ) : Promise<any> => {
        try
        {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user)
            {
                return res.status(400).json({errors: [{ msg: 'Invalid Credentials' }]});
            }
            const isMatch = comparePassword(password, user.hash);
            if (!isMatch)
            {
                return res.status(400).json({errors: [{ msg: 'Invalid Credentials' }]});
            }
            const tokens = await generateTokens(user);
            return res.status(200).json({
                accessToken: tokens.accessToken,
                accessTokenExpiresAt: tokens.accessTokenExpiresAt,
                refreshToken: tokens.refreshToken,
                refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
            });
        }
        catch (error: any)
        {
            console.log(error.message);
            return res.status(500).json({errors: [{ msg: 'Server Error' }]});
        }
    });

// @route   POST api/auth/refresh-token
// @desc    Refresh token
// @access  Public
router.post('/refresh-token',
    async ( req: Request, res: Response ) : Promise<any> => {
        try
        {
            const headerToken = req.headers.authorization;
            if (!headerToken)
            {
                return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
            }
            const refreshToken = headerToken.split(' ')[1];
            if (!refreshToken)
            {
                return res.status(401).json({ errors: [{ msg: 'No token, authorization denied' }] });
            }
            const userToken = await UserRefreshToken.findOne({ refreshToken: refreshToken });
            if (!userToken)
            {
                return res.status(401).json({ errors: [{ msg: 'Invalid token' }] });
            }
            const newTokens = await refreshAccessToken(refreshToken);
            return res.status(200).send({
                accessToken: newTokens.newAccessToken,
                accessTokenExpiresAt: newTokens.newAccessTokenExpiresAt,
            });
        }
        catch (error: any)
        {
            console.error(error.message);
            return res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    });

export { router as authRouter };
