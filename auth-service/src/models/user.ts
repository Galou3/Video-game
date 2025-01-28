import { Document, model, Schema } from 'mongoose';

interface IUser extends Document {
    username : string;
    hash : string;
}

const UserSchema = new Schema<IUser> ( {
    username : {
        type : String,
        required : true,
        unique : true,
    },
    hash : {
        type : String,
        required : true
    },
} );

const UserModel = model<IUser> ( 'User', UserSchema );

export { IUser, UserModel as User };
