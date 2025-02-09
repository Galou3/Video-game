// combatController.ts
import express, { Request, Response } from 'express';

const router = express.Router();

const getCombatResult = (playerMove: string, enemyMove: string) => {
  if (playerMove === enemyMove) return 'tie';
  if (
    (playerMove === 'rock' && enemyMove === 'scissors') ||
    (playerMove === 'paper' && enemyMove === 'rock') ||
    (playerMove === 'scissors' && enemyMove === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
};

router.post('/attack', async (req: Request, res: Response) => {
  try {
    const { runId, playerMove } = req.body;
    const moves = ['rock', 'paper', 'scissors'];
    const enemyMove = moves[Math.floor(Math.random() * moves.length)];

    const result = getCombatResult(playerMove, enemyMove);

    // Calcul des dégâts
    let hpLost = 0;
    if (result === 'lose') {
      hpLost = Math.floor(Math.random() * 10) + 5;
    }
    res.json({
      message: result === 'win'
        ? "Tu as gagné le combat !"
        : result === 'tie'
          ? "Match nul, réessaie !"
          : "Tu as perdu ce round.",
      result,
      enemyMove,
      hpLost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du combat." });
  }
});

export { router as combatRouter };
