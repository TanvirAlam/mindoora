-- Migration: Enhanced Multiplayer Game Tracking System
-- Description: Improves game tracking to handle detailed multiplayer scenarios with precise timing and winner determination
-- This migration enhances existing tables and adds new functionality to support:
-- 1. Precise answer timing (with millisecond precision)
-- 2. Detailed game session tracking
-- 3. Real-time leaderboard calculation
-- 4. Winner determination based on speed and accuracy
-- 5. Comprehensive game analytics

-- First, let's modify the existing QuestionsSolved table to add millisecond precision and answer order
ALTER TABLE "QuestionsSolved" 
ADD COLUMN IF NOT EXISTS "answeredAtMs" BIGINT, -- Timestamp in milliseconds for precise timing
ADD COLUMN IF NOT EXISTS "answerOrder" INTEGER, -- Order in which this question was answered in the game
ADD COLUMN IF NOT EXISTS "reactionTime" INTEGER; -- Time taken to react (in milliseconds)

-- Add comment explaining the new columns
COMMENT ON COLUMN "QuestionsSolved"."answeredAtMs" IS 'Precise timestamp in milliseconds when the answer was submitted';
COMMENT ON COLUMN "QuestionsSolved"."answerOrder" IS 'Order in which this specific question was answered across all players (1st, 2nd, 3rd, etc.)';
COMMENT ON COLUMN "QuestionsSolved"."reactionTime" IS 'Time taken to react and answer in milliseconds';

-- Create index for fast ordering by answer time
CREATE INDEX IF NOT EXISTS "idx_questions_solved_answered_at_ms" ON "QuestionsSolved"("questionId", "answeredAtMs");
CREATE INDEX IF NOT EXISTS "idx_questions_solved_answer_order" ON "QuestionsSolved"("questionId", "answerOrder");

-- Create a comprehensive Game Sessions table to track each game instance with metadata
CREATE TABLE IF NOT EXISTS "GameSessions" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roomId" uuid NOT NULL,
    "gameId" uuid NOT NULL,
    "sessionStartedAt" TIMESTAMP DEFAULT NOW(),
    "sessionEndedAt" TIMESTAMP,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalPlayers" INTEGER NOT NULL DEFAULT 0,
    "currentQuestionIndex" INTEGER DEFAULT 0,
    "status" VARCHAR DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed', 'aborted'
    "gameMode" VARCHAR DEFAULT 'standard', -- 'standard', 'speed', 'survival', etc.
    "maxPlayersAllowed" INTEGER DEFAULT 5,
    "sessionMetadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT "fk_game_sessions_room" FOREIGN KEY ("roomId") REFERENCES "GameRooms"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_game_sessions_game" FOREIGN KEY ("gameId") REFERENCES "UserGame"("id") ON DELETE CASCADE
);

-- Add indexes for GameSessions
CREATE INDEX IF NOT EXISTS "idx_game_sessions_room_id" ON "GameSessions"("roomId");
CREATE INDEX IF NOT EXISTS "idx_game_sessions_game_id" ON "GameSessions"("gameId");
CREATE INDEX IF NOT EXISTS "idx_game_sessions_status" ON "GameSessions"("status");

-- Add comments to GameSessions table
COMMENT ON TABLE "GameSessions" IS 'Tracks individual game sessions with detailed metadata and real-time status';
COMMENT ON COLUMN "GameSessions"."sessionStartedAt" IS 'When the actual gameplay started (first question displayed)';
COMMENT ON COLUMN "GameSessions"."sessionEndedAt" IS 'When the game session ended';
COMMENT ON COLUMN "GameSessions"."currentQuestionIndex" IS 'Current question being displayed (0-based index)';
COMMENT ON COLUMN "GameSessions"."sessionMetadata" IS 'Additional session data like settings, rules, etc.';

-- Create detailed Player Performance table for comprehensive tracking
CREATE TABLE IF NOT EXISTS "PlayerPerformance" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" uuid NOT NULL,
    "playerId" uuid NOT NULL,
    "totalPoints" INTEGER DEFAULT 0,
    "correctAnswers" INTEGER DEFAULT 0,
    "incorrectAnswers" INTEGER DEFAULT 0,
    "questionsAttempted" INTEGER DEFAULT 0,
    "averageReactionTime" INTEGER DEFAULT 0, -- in milliseconds
    "fastestCorrectAnswer" INTEGER, -- fastest correct answer time in ms
    "slowestCorrectAnswer" INTEGER, -- slowest correct answer time in ms
    "streak" INTEGER DEFAULT 0, -- current correct answer streak
    "maxStreak" INTEGER DEFAULT 0, -- maximum streak achieved
    "rank" INTEGER, -- final rank in the game (1st, 2nd, 3rd, etc.)
    "pointsFromSpeed" INTEGER DEFAULT 0, -- bonus points from being fast
    "pointsFromAccuracy" INTEGER DEFAULT 0, -- points from correct answers
    "performanceMetadata" JSONB DEFAULT '{}', -- additional performance metrics
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT "fk_player_performance_session" FOREIGN KEY ("sessionId") REFERENCES "GameSessions"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_player_performance_player" FOREIGN KEY ("playerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE,
    UNIQUE("sessionId", "playerId")
);

-- Add indexes for PlayerPerformance
CREATE INDEX IF NOT EXISTS "idx_player_performance_session_id" ON "PlayerPerformance"("sessionId");
CREATE INDEX IF NOT EXISTS "idx_player_performance_player_id" ON "PlayerPerformance"("playerId");
CREATE INDEX IF NOT EXISTS "idx_player_performance_rank" ON "PlayerPerformance"("sessionId", "rank");
CREATE INDEX IF NOT EXISTS "idx_player_performance_points" ON "PlayerPerformance"("sessionId", "totalPoints" DESC);

-- Add comments to PlayerPerformance table
COMMENT ON TABLE "PlayerPerformance" IS 'Comprehensive player performance tracking for each game session';
COMMENT ON COLUMN "PlayerPerformance"."averageReactionTime" IS 'Average time taken to answer questions in milliseconds';
COMMENT ON COLUMN "PlayerPerformance"."pointsFromSpeed" IS 'Bonus points awarded for quick correct answers';
COMMENT ON COLUMN "PlayerPerformance"."streak" IS 'Current consecutive correct answers';

-- Create Question Attempts table for detailed question-level analytics
CREATE TABLE IF NOT EXISTS "QuestionAttempts" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" uuid NOT NULL,
    "questionId" uuid NOT NULL,
    "playerId" uuid NOT NULL,
    "attemptedAnswer" VARCHAR,
    "isCorrect" BOOLEAN DEFAULT false,
    "timeTakenMs" INTEGER NOT NULL, -- Time taken in milliseconds
    "displayedAt" TIMESTAMP NOT NULL, -- When question was shown to player
    "answeredAt" TIMESTAMP, -- When player submitted answer
    "timeoutAt" TIMESTAMP, -- When question timed out
    "pointsEarned" INTEGER DEFAULT 0,
    "speedRank" INTEGER, -- Rank based on speed for this question (1 = fastest)
    "wasFirstCorrect" BOOLEAN DEFAULT false, -- Was this the first correct answer for this question?
    "attemptMetadata" JSONB DEFAULT '{}', -- Store additional data like partial answers, hesitation time, etc.
    "createdAt" TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT "fk_question_attempts_session" FOREIGN KEY ("sessionId") REFERENCES "GameSessions"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_question_attempts_question" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_question_attempts_player" FOREIGN KEY ("playerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE,
    UNIQUE("sessionId", "questionId", "playerId")
);

-- Add indexes for QuestionAttempts
CREATE INDEX IF NOT EXISTS "idx_question_attempts_session_question" ON "QuestionAttempts"("sessionId", "questionId");
CREATE INDEX IF NOT EXISTS "idx_question_attempts_player" ON "QuestionAttempts"("playerId");
CREATE INDEX IF NOT EXISTS "idx_question_attempts_timing" ON "QuestionAttempts"("questionId", "answeredAt") WHERE "isCorrect" = true;
CREATE INDEX IF NOT EXISTS "idx_question_attempts_speed_rank" ON "QuestionAttempts"("questionId", "speedRank") WHERE "isCorrect" = true;

-- Add comments to QuestionAttempts table
COMMENT ON TABLE "QuestionAttempts" IS 'Detailed tracking of every question attempt with precise timing';
COMMENT ON COLUMN "QuestionAttempts"."displayedAt" IS 'Exact timestamp when question was displayed to the player';
COMMENT ON COLUMN "QuestionAttempts"."speedRank" IS 'Ranking based on answer speed among correct answers (1 = fastest)';
COMMENT ON COLUMN "QuestionAttempts"."wasFirstCorrect" IS 'Whether this was the first correct answer submitted for this question';

-- Create Live Leaderboard table for real-time updates during games
CREATE TABLE IF NOT EXISTS "LiveLeaderboard" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" uuid NOT NULL,
    "playerId" uuid NOT NULL,
    "playerName" VARCHAR NOT NULL,
    "currentPoints" INTEGER DEFAULT 0,
    "currentRank" INTEGER DEFAULT 1,
    "questionsAnswered" INTEGER DEFAULT 0,
    "correctAnswers" INTEGER DEFAULT 0,
    "currentStreak" INTEGER DEFAULT 0,
    "lastUpdated" TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT "fk_live_leaderboard_session" FOREIGN KEY ("sessionId") REFERENCES "GameSessions"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_live_leaderboard_player" FOREIGN KEY ("playerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE,
    UNIQUE("sessionId", "playerId")
);

-- Add indexes for LiveLeaderboard
CREATE INDEX IF NOT EXISTS "idx_live_leaderboard_session_rank" ON "LiveLeaderboard"("sessionId", "currentRank");
CREATE INDEX IF NOT EXISTS "idx_live_leaderboard_session_points" ON "LiveLeaderboard"("sessionId", "currentPoints" DESC);

-- Add comments to LiveLeaderboard table
COMMENT ON TABLE "LiveLeaderboard" IS 'Real-time leaderboard that updates during active games';
COMMENT ON COLUMN "LiveLeaderboard"."currentRank" IS 'Current ranking position in the game';

-- Update the existing userGameScore table to include session reference
ALTER TABLE "userGameScore" 
ADD COLUMN IF NOT EXISTS "sessionId" uuid,
ADD COLUMN IF NOT EXISTS "finalRank" INTEGER,
ADD COLUMN IF NOT EXISTS "completionPercentage" REAL DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "speedBonus" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "accuracyBonus" INTEGER DEFAULT 0;

-- Add foreign key constraint for sessionId in userGameScore
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_user_game_score_session'
    ) THEN
        ALTER TABLE "userGameScore" 
        ADD CONSTRAINT "fk_user_game_score_session" 
        FOREIGN KEY ("sessionId") REFERENCES "GameSessions"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Add index for sessionId in userGameScore
CREATE INDEX IF NOT EXISTS "idx_user_game_score_session_id" ON "userGameScore"("sessionId");

-- Add comments to new userGameScore columns
COMMENT ON COLUMN "userGameScore"."sessionId" IS 'Reference to the specific game session';
COMMENT ON COLUMN "userGameScore"."finalRank" IS 'Final ranking in the game (1st, 2nd, 3rd, etc.)';
COMMENT ON COLUMN "userGameScore"."completionPercentage" IS 'Percentage of questions answered';
COMMENT ON COLUMN "userGameScore"."speedBonus" IS 'Bonus points for quick answers';
COMMENT ON COLUMN "userGameScore"."accuracyBonus" IS 'Bonus points for accuracy';

-- Create function to automatically update answer order when questions are solved
CREATE OR REPLACE FUNCTION update_answer_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate the answer order for this question
    NEW."answerOrder" := (
        SELECT COALESCE(MAX("answerOrder"), 0) + 1
        FROM "QuestionsSolved" 
        WHERE "questionId" = NEW."questionId"
    );
    
    -- Set the answered timestamp in milliseconds
    IF NEW."answeredAtMs" IS NULL THEN
        NEW."answeredAtMs" := EXTRACT(EPOCH FROM NOW()) * 1000;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set answer order
DROP TRIGGER IF EXISTS "trigger_update_answer_order" ON "QuestionsSolved";
CREATE TRIGGER "trigger_update_answer_order"
    BEFORE INSERT ON "QuestionsSolved"
    FOR EACH ROW
    EXECUTE FUNCTION update_answer_order();

-- Create function to update live leaderboard
CREATE OR REPLACE FUNCTION update_live_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert into live leaderboard
    INSERT INTO "LiveLeaderboard" (
        "sessionId", 
        "playerId", 
        "playerName", 
        "currentPoints",
        "questionsAnswered",
        "correctAnswers",
        "currentStreak"
    )
    SELECT 
        gs."id" as "sessionId",
        NEW."playerId",
        gp."name" as "playerName",
        COALESCE(SUM(qs."point"), 0) as "currentPoints",
        COUNT(qs."id") as "questionsAnswered",
        COUNT(CASE WHEN qs."isRight" = true THEN 1 END) as "correctAnswers",
        -- Calculate current streak (consecutive correct answers from the end)
        COALESCE((
            WITH recent_answers AS (
                SELECT "isRight", ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) as rn
                FROM "QuestionsSolved" 
                WHERE "playerId" = NEW."playerId"
            )
            SELECT COUNT(*) 
            FROM recent_answers 
            WHERE "isRight" = true AND rn <= (
                SELECT MIN(rn) - 1 
                FROM recent_answers 
                WHERE "isRight" = false
                UNION SELECT COUNT(*) + 1 FROM recent_answers
                LIMIT 1
            )
        ), 0) as "currentStreak"
    FROM "GameSessions" gs
    JOIN "GamePlayers" gp ON gp."roomId" = gs."roomId" AND gp."id" = NEW."playerId"
    LEFT JOIN "QuestionsSolved" qs ON qs."playerId" = NEW."playerId"
    WHERE gp."id" = NEW."playerId"
    GROUP BY gs."id", NEW."playerId", gp."name"
    
    ON CONFLICT ("sessionId", "playerId") 
    DO UPDATE SET
        "currentPoints" = EXCLUDED."currentPoints",
        "questionsAnswered" = EXCLUDED."questionsAnswered",
        "correctAnswers" = EXCLUDED."correctAnswers",
        "currentStreak" = EXCLUDED."currentStreak",
        "lastUpdated" = NOW();
    
    -- Update ranks for all players in this session
    WITH ranked_players AS (
        SELECT 
            "playerId",
            ROW_NUMBER() OVER (ORDER BY "currentPoints" DESC, "correctAnswers" DESC, "lastUpdated" ASC) as new_rank
        FROM "LiveLeaderboard" 
        WHERE "sessionId" = (
            SELECT gs."id" 
            FROM "GameSessions" gs 
            JOIN "GamePlayers" gp ON gp."roomId" = gs."roomId" 
            WHERE gp."id" = NEW."playerId" 
            LIMIT 1
        )
    )
    UPDATE "LiveLeaderboard" 
    SET "currentRank" = ranked_players.new_rank
    FROM ranked_players
    WHERE "LiveLeaderboard"."playerId" = ranked_players."playerId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update live leaderboard when questions are solved
DROP TRIGGER IF EXISTS "trigger_update_live_leaderboard" ON "QuestionsSolved";
CREATE TRIGGER "trigger_update_live_leaderboard"
    AFTER INSERT ON "QuestionsSolved"
    FOR EACH ROW
    EXECUTE FUNCTION update_live_leaderboard();

-- Create a view for easy access to detailed game results
CREATE OR REPLACE VIEW "GameResultsDetailed" AS
SELECT 
    gs."id" as "sessionId",
    gs."roomId",
    gs."gameId",
    ug."title" as "gameTitle",
    gs."sessionStartedAt",
    gs."sessionEndedAt",
    gs."totalPlayers",
    gs."totalQuestions",
    gp."id" as "playerId",
    gp."name" as "playerName",
    gp."imgUrl" as "playerImage",
    ll."currentPoints" as "finalScore",
    ll."currentRank" as "finalRank",
    ll."questionsAnswered",
    ll."correctAnswers",
    ROUND(
        CASE 
            WHEN ll."questionsAnswered" > 0 
            THEN (ll."correctAnswers"::DECIMAL / ll."questionsAnswered" * 100)
            ELSE 0 
        END, 
        2
    ) as "accuracyPercentage"
FROM "GameSessions" gs
JOIN "UserGame" ug ON ug."id" = gs."gameId"
JOIN "GamePlayers" gp ON gp."roomId" = gs."roomId"
LEFT JOIN "LiveLeaderboard" ll ON ll."sessionId" = gs."id" AND ll."playerId" = gp."id"
ORDER BY gs."sessionStartedAt" DESC, ll."currentRank" ASC;

-- Add comment to the view
COMMENT ON VIEW "GameResultsDetailed" IS 'Comprehensive view of game results with detailed player performance metrics';

-- Create a view for question-level analytics
CREATE OR REPLACE VIEW "QuestionAnalytics" AS
SELECT 
    q."id" as "questionId",
    q."question",
    q."gameId",
    ug."title" as "gameTitle",
    COUNT(qs.*) as "totalAttempts",
    COUNT(CASE WHEN qs."isRight" = true THEN 1 END) as "correctAttempts",
    COUNT(CASE WHEN qs."isRight" = false THEN 1 END) as "incorrectAttempts",
    ROUND(
        CASE 
            WHEN COUNT(qs.*) > 0 
            THEN (COUNT(CASE WHEN qs."isRight" = true THEN 1 END)::DECIMAL / COUNT(qs.*) * 100)
            ELSE 0 
        END, 
        2
    ) as "successRate",
    AVG(CASE WHEN qs."isRight" = true THEN qs."timeTaken" END) as "avgCorrectTime",
    MIN(CASE WHEN qs."isRight" = true THEN qs."timeTaken" END) as "fastestCorrectTime",
    MAX(CASE WHEN qs."isRight" = true THEN qs."timeTaken" END) as "slowestCorrectTime"
FROM "Questions" q
LEFT JOIN "QuestionsSolved" qs ON qs."questionId" = q."id"
LEFT JOIN "UserGame" ug ON ug."id" = q."gameId"
GROUP BY q."id", q."question", q."gameId", ug."title"
ORDER BY "successRate" DESC;

-- Add comment to the question analytics view
COMMENT ON VIEW "QuestionAnalytics" IS 'Analytics view showing success rates and timing data for each question';

-- Add indexes for better performance on the new columns
CREATE INDEX IF NOT EXISTS "idx_questions_solved_ms_timing" ON "QuestionsSolved"("answeredAtMs", "isRight");
CREATE INDEX IF NOT EXISTS "idx_questions_solved_reaction_time" ON "QuestionsSolved"("reactionTime") WHERE "isRight" = true;

-- Update the trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updating timestamps on new tables
CREATE TRIGGER update_game_sessions_updated_at 
    BEFORE UPDATE ON "GameSessions" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_performance_updated_at 
    BEFORE UPDATE ON "PlayerPerformance" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
