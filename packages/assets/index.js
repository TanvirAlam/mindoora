const path = require('path');

// Base path for assets
const ASSETS_BASE_PATH = __dirname;

// Trophy asset paths
const TROPHY_ASSETS = {
  influencer: path.join(ASSETS_BASE_PATH, 'trophies', 'Influencer.png'),
  brainiacExpert: path.join(ASSETS_BASE_PATH, 'trophies', 'brainiac-expert.png'),
  brainiac: path.join(ASSETS_BASE_PATH, 'trophies', 'brainiac.png'),
  bronzeSharpshooter: path.join(ASSETS_BASE_PATH, 'trophies', 'bronze-saharpshooter.png'),
  champion: path.join(ASSETS_BASE_PATH, 'trophies', 'champion.png'),
  creator: path.join(ASSETS_BASE_PATH, 'trophies', 'creator.png'),
  dinnerParty: path.join(ASSETS_BASE_PATH, 'trophies', 'dinner-party.png'),
  fireMorning: path.join(ASSETS_BASE_PATH, 'trophies', 'fire-morning.png'),
  funDay: path.join(ASSETS_BASE_PATH, 'trophies', 'fun-day.png'),
  geoMaster: path.join(ASSETS_BASE_PATH, 'trophies', 'geo-master.png'),
  hallOfFame: path.join(ASSETS_BASE_PATH, 'trophies', 'hall-of-fame.png'),
  hollywood: path.join(ASSETS_BASE_PATH, 'trophies', 'hollywood.png'),
  kingOfHosting: path.join(ASSETS_BASE_PATH, 'trophies', 'king-of-hosting.png'),
  lightningHour: path.join(ASSETS_BASE_PATH, 'trophies', 'lightning-hour.png'),
  mathGenius: path.join(ASSETS_BASE_PATH, 'trophies', 'math-genius.png'),
  movieLover: path.join(ASSETS_BASE_PATH, 'trophies', 'movie-lover.png'),
  musicFan: path.join(ASSETS_BASE_PATH, 'trophies', 'music-fan.png'),
  partyHost: path.join(ASSETS_BASE_PATH, 'trophies', 'party-host.png'),
  pinkSharpshooter: path.join(ASSETS_BASE_PATH, 'trophies', 'pink-sharpshooter.png'),
  quizBuffBronze: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-buff-bronze.png'),
  quizBuffGold: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-buff-gold.png'),
  quizBuffPlatinum: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-buff-platinum.png'),
  quizBuffSilver: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-buff-silver.png'),
  quizMasterBronze: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-master-bronze.png'),
  quizMasterGold: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-master-gold.png'),
  quizMasterPlatinum: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-master-platinum.png'),
  quizMasterSilver: path.join(ASSETS_BASE_PATH, 'trophies', 'quiz-master-silver.png'),
  rookie: path.join(ASSETS_BASE_PATH, 'trophies', 'rookie.png'),
  scienceNerd: path.join(ASSETS_BASE_PATH, 'trophies', 'science-nerd.png'),
  silverSharpshooter: path.join(ASSETS_BASE_PATH, 'trophies', 'silver-sharpshooter.png'),
  sportBuff: path.join(ASSETS_BASE_PATH, 'trophies', 'sport-buff.png'),
  streakKing: path.join(ASSETS_BASE_PATH, 'trophies', 'streak-king.png'),
  televisionBinge: path.join(ASSETS_BASE_PATH, 'trophies', 'television-binge.png'),
  theHost: path.join(ASSETS_BASE_PATH, 'trophies', 'the-host.png'),
  trendsetter: path.join(ASSETS_BASE_PATH, 'trophies', 'trendsetter.png'),
};

// Helper function to get trophy path by name
const getTrophyPath = (trophyName) => {
  return TROPHY_ASSETS[trophyName] || null;
};

// Helper function to get all trophy paths
const getAllTrophyPaths = () => {
  return TROPHY_ASSETS;
};

// Helper function to get trophy directory
const getTrophyDirectory = () => {
  return path.join(ASSETS_BASE_PATH, 'trophies');
};

module.exports = {
  ASSETS_BASE_PATH,
  TROPHY_ASSETS,
  getTrophyPath,
  getAllTrophyPaths,
  getTrophyDirectory,
};
