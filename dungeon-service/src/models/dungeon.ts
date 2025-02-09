import { Document, model, Schema } from 'mongoose';

interface IDungeon extends Document {
	name: string;
	layout: string[][];
}

const Dungeon = new Schema<IDungeon>({
	name: String,
	layout: [
		[
			{type: String, enum: ["FLOOR", "ENNEMY", "BOSS", "DOOR"], default: "FLOOR"}
		],
	],
});

const DungeonModel = model<IDungeon>('Dungeon', Dungeon);

export { IDungeon, DungeonModel as Dungeon };
