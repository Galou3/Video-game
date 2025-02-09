import { Dungeon } from '../models/dungeon';
import { IDungeon } from "../models/dungeon";
export const generateRandomDungeon = (name: string, width: number, height: number): IDungeon => {
    // Ajouter un timestamp au nom pour le rendre unique
    const uniqueName = `${name} - ${Date.now()}`;
    
    const layout: string[][] = [];
    const cellTypes = ["FLOOR", "ENNEMY", "BOSS"];

    // Créer le layout de base
    for (let i = 0; i < height; i++) {
        const row: string[] = [];
        for (let j = 0; j < width; j++) {
            const randomValue = Math.random();
            let cellType = "FLOOR";
            
            if (randomValue < 0.2) { 
                cellType = "ENNEMY";
            } else if (randomValue < 0.15) { 
                cellType = "BOSS";
            }
            
            row.push(cellType);
        }
        layout.push(row);
    }

    // Ajouter une seule porte à une position aléatoire
    let doorX, doorY;
    do {
        doorX = Math.floor(Math.random() * height);
        doorY = Math.floor(Math.random() * width);
    } while (layout[doorX][doorY] !== "FLOOR"); // S'assurer que la porte est sur un FLOOR

    layout[doorX][doorY] = "DOOR";

    return new Dungeon({ name: uniqueName, layout });
};
