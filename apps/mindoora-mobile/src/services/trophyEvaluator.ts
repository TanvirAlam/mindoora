import { Trophy } from './trophyService';

export interface GamePerformance {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent?: number;
  gameType?: string;
}

export interface EarnedTrophy {
  id: string;
  name: string;
  description: string;
  trophyRank: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  image: any; // Require reference for the trophy image
  isNewlyEarned: boolean;
}

class TrophyEvaluator {
  // Define the 3 trophies assigned to each game
  private gameAssignedTrophies = [
    {
      id: 'quiz_master_gold',
      name: 'Quiz Master',
      description: 'Score 90% or higher',
      trophyRank: 'gold' as const,
      icon: '🎓',
      image: require('../../../../packages/assets/trophies/quiz-master-gold.png'),
      criteria: (performance: GamePerformance) => performance.accuracy >= 90
    },
    {
      id: 'quiz_master_silver',
      name: 'Knowledge Seeker',
      description: 'Score 80% or higher',
      trophyRank: 'silver' as const,
      icon: '📚',
      image: require('../../../../packages/assets/trophies/quiz-master-silver.png'),
      criteria: (performance: GamePerformance) => performance.accuracy >= 80
    },
    {
      id: 'quiz_master_bronze',
      name: 'Quick Thinker',
      description: 'Score 70% or higher',
      trophyRank: 'bronze' as const,
      icon: '💡',
      image: require('../../../../packages/assets/trophies/quiz-master-bronze.png'),
      criteria: (performance: GamePerformance) => performance.accuracy >= 70
    }
  ];

  // Evaluate performance and return earned trophies
  evaluatePerformance(performance: GamePerformance, existingTrophies: string[] = []): EarnedTrophy[] {
    const earnedTrophies: EarnedTrophy[] = [];

    for (const trophyDef of this.gameAssignedTrophies) {
      if (trophyDef.criteria(performance)) {
        const isNewlyEarned = !existingTrophies.includes(trophyDef.id);
        
        earnedTrophies.push({
          id: trophyDef.id,
          name: trophyDef.name,
          description: trophyDef.description,
          trophyRank: trophyDef.trophyRank,
          icon: trophyDef.icon,
          image: trophyDef.image,
          isNewlyEarned
        });
      }
    }

    // Sort by rarity (platinum first, then gold, silver, bronze)
    return earnedTrophies.sort((a, b) => {
      const rarityOrder = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
      return rarityOrder[a.trophyRank] - rarityOrder[b.trophyRank];
    });
  }

  // Get trophy rarity color
  getTrophyColor(rarity: string): string {
    switch (rarity) {
      case 'platinum': return '#E5E4E2';
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return '#FFD700';
    }
  }

  // Get trophy glow color
  getTrophyGlow(rarity: string): string {
    switch (rarity) {
      case 'platinum': return '#FFFFFF';
      case 'gold': return '#FFD700';
      case 'silver': return '#E6E6FA';
      case 'bronze': return '#DEB887';
      default: return '#FFD700';
    }
  }
}

export default new TrophyEvaluator();
