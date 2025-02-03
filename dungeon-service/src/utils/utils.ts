import { Dungeon } from '../models/dungeon';
import { IDungeon } from "../models/dungeon";
export const generateRandomDungeon = (name: string, width: number, height: number): IDungeon => {
    const layout: string[][] = [];

    const cellTypes = ["FLOOR", "ENNEMY", "BOSS"];

    for (let i = 0; i < height; i++) {
        const row: string[] = [];
        for (let j = 0; j < width; j++) {
            const randomCell = cellTypes[Math.floor(Math.random() * cellTypes.length)];
            row.push(randomCell);
        }
        layout.push(row);
    }
    return new Dungeon ( { name, layout } );
};
