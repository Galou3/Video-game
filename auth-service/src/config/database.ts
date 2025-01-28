import mongoose from 'mongoose';

const MONGO_HOST : string = process.env.MONGO_HOST || 'http://localhost';
const PORT : number = parseInt ( process.env.MONGO_PORT || '27017' );
const MONGO_DATABASE = process.env.MONGO_DATABASE || 'authdb';
const MONGO_USER : string = process.env.MONGO_USER || 'root';
const MONGO_PASSWORD : string = process.env.MONGO_PASSWORD || 'root';

export const connectToDatabase = async () : Promise<void> => {
    try {
        await mongoose.connect ( `mongodb://${ MONGO_HOST }:${ PORT }/${ MONGO_DATABASE }`, {
            authSource : 'admin',
            user : MONGO_USER,
            pass : MONGO_PASSWORD
        } );
        console.log ( "Connected to MongoDB" );
    } catch ( error ) {
        console.error ( "Error connecting to MongoDB:", error );
    }
};
