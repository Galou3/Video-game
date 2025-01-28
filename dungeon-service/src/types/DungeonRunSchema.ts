import mongoose from "mongoose";

export const Coordinates = {x: Number, y: Number};

export const DungeonRunSchema = new mongoose.Schema({
	userId: String,
	heroId: String,
	dungeonId: String,
	isRunning: Boolean,
	lastPos: Coordinates,
});
