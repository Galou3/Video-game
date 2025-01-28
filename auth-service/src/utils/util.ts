import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtExpiration, jwtRefreshExpiration, PRIV_KEY, PUB_KEY } from "../config/auth.config";
import { UserRefreshToken } from "../models/userRefreshToken";
import { IUser, User } from '../models/user';
import crypto from 'crypto';

export const hashPassword = async (password: string) => {
    try
    {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash ( password, salt );
    }
    catch (error)
    {
        console.log('Error hashing password:', error);
    }
};

export const comparePassword = async (password: string, hash: string) => {
    try
    {
        return await bcrypt.compare ( password, hash );
    }
    catch (error)
    {
        console.log('Error comparing password:', error);
    }
}

export const generateTokens = async (user: IUser): Promise<{ accessToken: string, accessTokenExpiresAt: Date, refreshToken: string, refreshTokenExpiresAt: Date }> => {
    try
    {
        const payload = { _id: user._id };

        const accessToken = jwt.sign(
            payload,
            PRIV_KEY,
            { expiresIn: jwtExpiration, algorithm: 'RS256' }
        );
        const refreshToken = crypto.randomBytes(64).toString('hex');

        const userRefreshToken = await UserRefreshToken.findOne({ user: user._id });

        if (userRefreshToken) await UserRefreshToken.deleteOne({ user: user._id });

        const accessTokenExpiresAt = new Date();
        accessTokenExpiresAt.setSeconds(
            accessTokenExpiresAt.getSeconds() + jwtExpiration
        );

        const refreshTokenExpiresAt = new Date();
        refreshTokenExpiresAt.setSeconds(
            refreshTokenExpiresAt.getSeconds() + jwtRefreshExpiration
        );

        await new UserRefreshToken({ User: user._id, refreshToken: refreshToken, expiresAt: refreshTokenExpiresAt }).save();

        return Promise.resolve({
            accessToken: accessToken,
            accessTokenExpiresAt: accessTokenExpiresAt,
            refreshToken: refreshToken,
            refreshTokenExpiresAt: refreshTokenExpiresAt
        });
    }
    catch (error: any)
    {
        console.log(error.message);
        return Promise.reject(error);
    }
}

export const refreshAccessToken = async (refreshToken: string): Promise<{ newAccessToken: string, newAccessTokenExpiresAt: Date }> => {
    try
    {
        const existingUserToken = await UserRefreshToken.findOne({ refreshToken: refreshToken });
        if (!existingUserToken) throw new Error('Invalid token');

        const user = await User.findById(existingUserToken.User);
        if (!user) throw new Error('User not found');

        const payload = { _id: user._id };

        const newAccessToken = jwt.sign(
            payload,
            PRIV_KEY,
            { expiresIn: jwtExpiration, algorithm: 'RS256' }
        );

        const newAccessTokenExpiresAt = new Date();
        newAccessTokenExpiresAt.setSeconds(
            newAccessTokenExpiresAt.getSeconds() + jwtExpiration
        );

        return Promise.resolve({
            newAccessToken: newAccessToken,
            newAccessTokenExpiresAt: newAccessTokenExpiresAt
        });
    }
    catch (error: any)
    {
        console.log(error.message);
        return Promise.reject(error);
    }
};

