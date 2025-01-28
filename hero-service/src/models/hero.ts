import { Document, model, Schema } from 'mongoose';

interface IHero extends Document {
    userId : string;
    name : string;
    level : number;
    hp : number;
    gold : number;
    inventory : string[];
}

const HeroSchema = new Schema<IHero> ( {
    userId : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    level : {
        type : Number,
        default : 1
    },
    hp : {
        type : Number,
        default : 100
    },
    gold : {
        type : Number,
        default : 0
    },
    inventory : {
        type : [String],
        default : []
    }
} );

const HeroModel = model<IHero> ( 'Hero', HeroSchema );

export { IHero, HeroModel as Hero };
