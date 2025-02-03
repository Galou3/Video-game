import { Document, model, Schema } from 'mongoose';

const CoordinatesSchema = new Schema({
	x: { type: Number, required: true },
	y: { type: Number, required: true }
});

interface IDungeonRun extends Document {
	userId: string;
	heroId: string;
	dungeonId: string;
	isRunning: boolean;
	lastPos: {
		x: number;
		y: number;
	};
}

const DungeonRun = new Schema<IDungeonRun>({
	userId: {
		type: String,
		required: true
	},
	heroId: {
		type: String,
		required: true
	},
	dungeonId: {
		type: String,
		required: true
	},
	isRunning: {
		type: Boolean,
		default: true
	},
	lastPos: {
		type: CoordinatesSchema,
		default: { x: 0, y: 0 }
	}
});

const DungeonRunModel = model<IDungeonRun>('DungeonRun', DungeonRun);

export { IDungeonRun, DungeonRunModel as DungeonRun };
