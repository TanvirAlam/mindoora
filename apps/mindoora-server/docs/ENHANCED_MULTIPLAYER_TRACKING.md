# Enhanced Multiplayer Game Tracking System

## 🎯 Overview

Your Mindoora quiz game now has a comprehensive enhanced multiplayer tracking system that automatically records detailed game data, determines winners based on speed and accuracy, and provides real-time analytics. All data is automatically captured when players participate in multiplayer games.

## 🗄️ New Database Tables

### 1. `GameSessions` 
Tracks individual game instances with metadata
- `id`, `roomId`, `gameId`
- `sessionStartedAt`, `sessionEndedAt` 
- `totalQuestions`, `totalPlayers`
- `currentQuestionIndex`, `status`, `gameMode`
- `maxPlayersAllowed`, `sessionMetadata`

### 2. `PlayerPerformance`
Comprehensive player performance tracking per session
- `sessionId`, `playerId`
- `totalPoints`, `correctAnswers`, `incorrectAnswers`
- `questionsAttempted`, `averageReactionTime`
- `fastestCorrectAnswer`, `slowestCorrectAnswer`
- `streak`, `maxStreak`, `rank`
- `pointsFromSpeed`, `pointsFromAccuracy`

### 3. `QuestionAttempts`
Detailed question-level analytics with precise timing
- `sessionId`, `questionId`, `playerId`
- `attemptedAnswer`, `isCorrect`, `timeTakenMs`
- `displayedAt`, `answeredAt`, `timeoutAt`
- `pointsEarned`, `speedRank`, `wasFirstCorrect`

### 4. `LiveLeaderboard`
Real-time leaderboard that updates during games
- `sessionId`, `playerId`, `playerName`
- `currentPoints`, `currentRank`
- `questionsAnswered`, `correctAnswers`, `currentStreak`
- `lastUpdated`

### 5. Enhanced Existing Tables
- **`QuestionsSolved`**: Added `answeredAtMs`, `answerOrder`, `reactionTime`
- **`userGameScore`**: Added `sessionId`, `finalRank`, `completionPercentage`, `speedBonus`, `accuracyBonus`

## 🚀 How It Works

### When a Game Starts:
1. **Game Room Creation**: When `startGameController` is called, it automatically:
   - Creates a new `GameSession` record
   - Initializes `LiveLeaderboard` entries for all players
   - Sets up `PlayerPerformance` tracking

### When Players Answer Questions:
1. **Automatic Data Recording**: The enhanced `createQuestionSolveController` now:
   - Records precise millisecond timestamps (`answeredAtMs`)
   - Automatically assigns answer order (1st, 2nd, 3rd, etc.)
   - Calculates reaction time in milliseconds
   - Creates `QuestionAttempts` records for detailed analytics
   - Updates `PlayerPerformance` metrics in real-time
   - Updates `LiveLeaderboard` rankings automatically via database triggers

### When a Game Ends:
1. **Winner Calculation**: The `updateGameRoomStatusController` automatically:
   - Calculates final rankings based on multiple criteria
   - Updates `userGameScore` with comprehensive results
   - Updates `GameWinners` table with top 3 players
   - Marks session as completed

## 🏆 Winner Determination Logic

Winners are determined using a comprehensive multi-criteria system:

1. **Primary**: Total Points (including speed bonuses)
2. **Secondary**: Number of Correct Answers
3. **Tertiary**: First Correct Answers (speed bonus)
4. **Quaternary**: Average Reaction Time
5. **Final Tiebreaker**: Accuracy Rate

### Speed Bonuses:
- Answers within 30% of time limit: +50% points
- Answers within 60% of time limit: +20% points
- First correct answer per question: Additional priority in rankings

## 📊 New API Endpoints

### Real-time Leaderboard
```
GET /api/v1/game/analytics/leaderboard/realtime?roomId=<room-id>
```
Returns live leaderboard with enhanced metrics during active games:
- Current rankings and points
- Accuracy percentages and streaks
- Speed metrics and grades
- Recent performance indicators

### Question Analysis
```
GET /api/v1/game/analytics/analysis/questions?sessionId=<session-id>&questionId=<question-id>
```
Detailed question-by-question analysis:
- Who answered first for each question
- Time advantages between players
- Success rates and difficulty analysis
- Speed rankings per question

### Session Summary
```
GET /api/v1/game/analytics/session/<session-id>/summary
```
Comprehensive session summary:
- Final standings with detailed metrics
- Speed champions (who answered first most often)
- Question difficulty analysis
- Game statistics and winner information

## 🔄 Automatic Data Flow

### 1. Game Creation → Session Initialization
```
Game Room Created → startGame() → GameSession + LiveLeaderboard + PlayerPerformance
```

### 2. Question Answering → Real-time Updates
```
Player Answers → Enhanced QuestionsSolved + QuestionAttempts + Updated Performance
                ↓
Database Triggers → Updated LiveLeaderboard Rankings
```

### 3. Game Completion → Final Results
```
Game Finished → Final Rankings → userGameScore + GameWinners + Session Completed
```

## 🎮 Enhanced Game Progress

Your existing `getGameProgressController` now automatically provides enhanced data when available:

```json
{
  "message": "Got enhanced game progress successfully",
  "result": {
    "players": [
      {
        "id": "player-id",
        "name": "Player Name",
        "currentQuestion": 5,
        "score": 850,
        "rank": 1,
        "correctAnswers": 4,
        "currentStreak": 3,
        "averageReactionTime": 2500,
        "fastestTime": 1800,
        "accuracyPercentage": 80.0
      }
    ],
    "sessionId": "session-id",
    "totalQuestions": 10,
    "leaderboard": true
  }
}
```

## 🔧 Key Features

### ✅ **Automatic Integration**
- No changes needed to your mobile app
- Existing endpoints automatically provide enhanced data
- Backward compatible with current implementations

### ✅ **Precise Timing**
- Millisecond precision for answer timestamps
- Automatic answer ordering (1st, 2nd, 3rd to answer)
- Reaction time tracking

### ✅ **Real-time Updates**
- Live leaderboard updates via database triggers
- Socket.IO events for real-time UI updates
- Automatic ranking recalculation

### ✅ **Comprehensive Analytics**
- Question difficulty analysis
- Speed champion tracking  
- Player performance metrics
- Session summaries and winner determination

### ✅ **Detailed Winner Logic**
- Multi-criteria winner determination
- Speed bonuses for quick correct answers
- Comprehensive tie-breaking system

## 📈 Database Views for Easy Queries

### `GameResultsDetailed`
Complete game results with player performance metrics

### `QuestionAnalytics` 
Success rates and timing data for each question

## 🚦 Migration Status

✅ **Database Migration**: Completed successfully  
✅ **Enhanced Controllers**: Integrated into existing endpoints  
✅ **New API Routes**: Available for advanced analytics  
✅ **Automatic Triggers**: Real-time leaderboard updates working  
✅ **Backward Compatibility**: Existing mobile app continues to work  

## 🎯 Usage Example

1. **Player joins game** → Automatic session initialization
2. **Player answers questions** → Real-time data recording and leaderboard updates
3. **Game ends** → Automatic winner calculation and final results
4. **View results** → Enhanced analytics available via existing and new endpoints

Your multiplayer quiz game now automatically tracks everything needed to determine fair winners and provide detailed analytics, all while maintaining compatibility with your existing mobile application!

## 🔍 Query Examples

### Get Winners of a Game Session
```sql
SELECT player_name, total_points, accuracy_rate, final_rank, trophy
FROM "GameResultsDetailed" 
WHERE session_id = 'your-session-id'
ORDER BY final_rank ASC;
```

### Find Speed Champions
```sql
SELECT player_name, first_correct_answers, avg_reaction_time
FROM [speed champions query]
ORDER BY first_correct_answers DESC;
```

### Question Difficulty Analysis
```sql
SELECT question, success_rate, avg_correct_time, difficulty_level
FROM "QuestionAnalytics"
WHERE game_id = 'your-game-id'
ORDER BY success_rate ASC;
```
