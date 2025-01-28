import { Document, Schema, model } from 'mongoose';
import { IUser } from './user';

interface IUserRefreshToken extends Document
{
    User: IUser;
    refreshToken: string;
    expiresAt: Date;
}

const UserRefreshTokenSchema = new Schema<IUserRefreshToken>({
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
});

const UserRefreshTokenModel = model<IUserRefreshToken>('UserRefreshToken', UserRefreshTokenSchema);

export { IUserRefreshToken, UserRefreshTokenModel as UserRefreshToken };
