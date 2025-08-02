export interface Trophy {
  id: string;
  name: string;
  image: any;
  category?: string;
}

// Import all trophy images
const trophyImages = {
  'influencer': require('../../../../packages/assets/trophies/Influencer.png'),
  'brainiac-expert': require('../../../../packages/assets/trophies/brainiac-expert.png'),
  'brainiac': require('../../../../packages/assets/trophies/brainiac.png'),
  'bronze-sharpshooter': require('../../../../packages/assets/trophies/bronze-saharpshooter.png'),
  'champion': require('../../../../packages/assets/trophies/champion.png'),
  'creator': require('../../../../packages/assets/trophies/creator.png'),
  'dinner-party': require('../../../../packages/assets/trophies/dinner-party.png'),
  'fire-morning': require('../../../../packages/assets/trophies/fire-morning.png'),
  'fun-day': require('../../../../packages/assets/trophies/fun-day.png'),
  'geo-master': require('../../../../packages/assets/trophies/geo-master.png'),
  'hall-of-fame': require('../../../../packages/assets/trophies/hall-of-fame.png'),
  'hollywood': require('../../../../packages/assets/trophies/hollywood.png'),
  'king-of-hosting': require('../../../../packages/assets/trophies/king-of-hosting.png'),
  'lightning-hour': require('../../../../packages/assets/trophies/lightning-hour.png'),
  'math-genius': require('../../../../packages/assets/trophies/math-genius.png'),
  'movie-lover': require('../../../../packages/assets/trophies/movie-lover.png'),
  'music-fan': require('../../../../packages/assets/trophies/music-fan.png'),
  'party-host': require('../../../../packages/assets/trophies/party-host.png'),
  'pink-sharpshooter': require('../../../../packages/assets/trophies/pink-sharpshooter.png'),
  'quiz-buff-bronze': require('../../../../packages/assets/trophies/quiz-buff-bronze.png'),
  'quiz-buff-gold': require('../../../../packages/assets/trophies/quiz-buff-gold.png'),
  'quiz-buff-platinum': require('../../../../packages/assets/trophies/quiz-buff-platinum.png'),
  'quiz-buff-silver': require('../../../../packages/assets/trophies/quiz-buff-silver.png'),
  'quiz-master-bronze': require('../../../../packages/assets/trophies/quiz-master-bronze.png'),
  'quiz-master-gold': require('../../../../packages/assets/trophies/quiz-master-gold.png'),
  'quiz-master-platinum': require('../../../../packages/assets/trophies/quiz-master-platinum.png'),
  'quiz-master-silver': require('../../../../packages/assets/trophies/quiz-master-silver.png'),
  'rookie': require('../../../../packages/assets/trophies/rookie.png'),
  'science-nerd': require('../../../../packages/assets/trophies/science-nerd.png'),
  'silver-sharpshooter': require('../../../../packages/assets/trophies/silver-sharpshooter.png'),
  'sport-buff': require('../../../../packages/assets/trophies/sport-buff.png'),
  'streak-king': require('../../../../packages/assets/trophies/streak-king.png'),
  'television-binge': require('../../../../packages/assets/trophies/television-binge.png'),
  'the-host': require('../../../../packages/assets/trophies/the-host.png'),
  'trendsetter': require('../../../../packages/assets/trophies/trendsetter.png'),
};

// Trophy data with categories
export const trophies: Trophy[] = [
  { id: 'quiz-master-gold', name: 'Quiz Master Gold', image: trophyImages['quiz-master-gold'], category: 'Achievement' },
  { id: 'quiz-master-silver', name: 'Quiz Master Silver', image: trophyImages['quiz-master-silver'], category: 'Achievement' },
  { id: 'quiz-master-bronze', name: 'Quiz Master Bronze', image: trophyImages['quiz-master-bronze'], category: 'Achievement' },
  { id: 'quiz-master-platinum', name: 'Quiz Master Platinum', image: trophyImages['quiz-master-platinum'], category: 'Achievement' },
  { id: 'quiz-buff-gold', name: 'Quiz Buff Gold', image: trophyImages['quiz-buff-gold'], category: 'Performance' },
  { id: 'quiz-buff-silver', name: 'Quiz Buff Silver', image: trophyImages['quiz-buff-silver'], category: 'Performance' },
  { id: 'quiz-buff-bronze', name: 'Quiz Buff Bronze', image: trophyImages['quiz-buff-bronze'], category: 'Performance' },
  { id: 'quiz-buff-platinum', name: 'Quiz Buff Platinum', image: trophyImages['quiz-buff-platinum'], category: 'Performance' },
  { id: 'champion', name: 'Champion', image: trophyImages['champion'], category: 'Victory' },
  { id: 'hall-of-fame', name: 'Hall of Fame', image: trophyImages['hall-of-fame'], category: 'Victory' },
  { id: 'brainiac', name: 'Brainiac', image: trophyImages['brainiac'], category: 'Intelligence' },
  { id: 'brainiac-expert', name: 'Brainiac Expert', image: trophyImages['brainiac-expert'], category: 'Intelligence' },
  { id: 'math-genius', name: 'Math Genius', image: trophyImages['math-genius'], category: 'Subject' },
  { id: 'science-nerd', name: 'Science Nerd', image: trophyImages['science-nerd'], category: 'Subject' },
  { id: 'geo-master', name: 'Geography Master', image: trophyImages['geo-master'], category: 'Subject' },
  { id: 'movie-lover', name: 'Movie Lover', image: trophyImages['movie-lover'], category: 'Entertainment' },
  { id: 'music-fan', name: 'Music Fan', image: trophyImages['music-fan'], category: 'Entertainment' },
  { id: 'hollywood', name: 'Hollywood', image: trophyImages['hollywood'], category: 'Entertainment' },
  { id: 'television-binge', name: 'TV Binge Watcher', image: trophyImages['television-binge'], category: 'Entertainment' },
  { id: 'sport-buff', name: 'Sports Buff', image: trophyImages['sport-buff'], category: 'Sports' },
  { id: 'streak-king', name: 'Streak King', image: trophyImages['streak-king'], category: 'Special' },
  { id: 'lightning-hour', name: 'Lightning Hour', image: trophyImages['lightning-hour'], category: 'Speed' },
  { id: 'fire-morning', name: 'Fire Morning', image: trophyImages['fire-morning'], category: 'Special' },
  { id: 'the-host', name: 'The Host', image: trophyImages['the-host'], category: 'Social' },
  { id: 'party-host', name: 'Party Host', image: trophyImages['party-host'], category: 'Social' },
  { id: 'king-of-hosting', name: 'King of Hosting', image: trophyImages['king-of-hosting'], category: 'Social' },
  { id: 'dinner-party', name: 'Dinner Party', image: trophyImages['dinner-party'], category: 'Social' },
  { id: 'fun-day', name: 'Fun Day', image: trophyImages['fun-day'], category: 'Social' },
  { id: 'influencer', name: 'Influencer', image: trophyImages['influencer'], category: 'Social' },
  { id: 'creator', name: 'Creator', image: trophyImages['creator'], category: 'Creative' },
  { id: 'trendsetter', name: 'Trendsetter', image: trophyImages['trendsetter'], category: 'Creative' },
  { id: 'rookie', name: 'Rookie', image: trophyImages['rookie'], category: 'Beginner' },
  { id: 'bronze-sharpshooter', name: 'Bronze Sharpshooter', image: trophyImages['bronze-sharpshooter'], category: 'Accuracy' },
  { id: 'silver-sharpshooter', name: 'Silver Sharpshooter', image: trophyImages['silver-sharpshooter'], category: 'Accuracy' },
  { id: 'pink-sharpshooter', name: 'Pink Sharpshooter', image: trophyImages['pink-sharpshooter'], category: 'Accuracy' },
];

export const getTrophyById = (id: string): Trophy | undefined => {
  return trophies.find(trophy => trophy.id === id);
};

export const getTrophiesByCategory = (category: string): Trophy[] => {
  return trophies.filter(trophy => trophy.category === category);
};

export const getAllCategories = (): string[] => {
  const categories = [...new Set(trophies.map(trophy => trophy.category || 'Other'))];
  return categories.sort();
};

// Default trophies for different places
export const getDefaultTrophies = () => ({
  first: getTrophyById('quiz-master-gold'),
  second: getTrophyById('quiz-master-silver'),
  third: getTrophyById('quiz-master-bronze')
});
