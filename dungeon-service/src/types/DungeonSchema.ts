import mongoose from "mongoose";

export const DungeonSchema = new mongoose.Schema({
	name: String,
	layout: [
		[
			{type: String, enum: ["FLOOR", "ENNEMY", "BOSS"], default: "FLOOR"}
		],
	],
});
