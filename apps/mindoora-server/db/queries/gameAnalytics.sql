-- ============================================================================
-- Mindoora Game Analytics Queries
-- ============================================================================
-- This file contains comprehensive SQL queries for analyzing multiplayer game
-- data, determining winners, and generating detailed reports.

-- ============================================================================
-- 1. GET DETAILED GAME SESSION RESULTS WITH WINNER ANALYSIS
-- ============================================================================
-- Query to get complete game session results with winner determination
-- based on speed, accuracy, and total points

SELECT 
    gs."id" as session_id,
    gs."gameId" as game_id,
    ug."title" as game_title,
    gs."sessionStartedAt" as started_at,
    gs."sessionEndedAt" as ended_at,
    gs."totalQuestions" as total_questions,
    gs."totalPlayers" as total_players,
    
    -- Player details
    gp."id" as player_id,
    gp."name" as player_name,
    gp."imgUrl" as player_image,
    
    -- Performance metrics
    ll."currentPoints" as final_points,
    ll."currentRank" as final_rank,
    ll."questionsAnswered" as questions_answered,
    ll."correctAnswers" as correct_answers,
    ll."currentStreak" as final_streak,
    
    -- Calculated metrics
    ROUND(
        CASE WHEN ll."questionsAnswered" > 0 
        THEN (ll."correctAnswers"::DECIMAL / ll."questionsAnswered" * 100)
        ELSE 0 END, 2
    ) as accuracy_percentage,
    
    -- Speed metrics
    AVG(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as avg_reaction_time_ms,
    MIN(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as fastest_reaction_ms,
    MAX(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as slowest_reaction_ms,
    
    -- First correct answers (speed winners)
    COUNT(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN 1 END) as first_correct_count,
    
    -- Winner determination
    CASE 
        WHEN ll."currentRank" = 1 THEN 'WINNER'
        WHEN ll."currentRank" <= 3 THEN 'TOP_3'
        ELSE 'PARTICIPANT'
    END as winner_status,
    
    CASE 
        WHEN ll."currentRank" = 1 THEN 'GOLD'
        WHEN ll."currentRank" = 2 THEN 'SILVER'
        WHEN ll."currentRank" = 3 THEN 'BRONZE'
        ELSE NULL
    END as trophy

FROM "GameSessions" gs
JOIN "UserGame" ug ON ug."id" = gs."gameId"
JOIN "GamePlayers" gp ON gp."roomId" = gs."roomId" AND gp."isApproved" = true
LEFT JOIN "LiveLeaderboard" ll ON ll."sessionId" = gs."id" AND ll."playerId" = gp."id"
LEFT JOIN "QuestionsSolved" qs ON qs."playerId" = gp."id"

WHERE gs."id" = $1  -- Replace with actual session ID
GROUP BY 
    gs."id", gs."gameId", ug."title", gs."sessionStartedAt", gs."sessionEndedAt",
    gs."totalQuestions", gs."totalPlayers", gp."id", gp."name", gp."imgUrl",
    ll."currentPoints", ll."currentRank", ll."questionsAnswered", 
    ll."correctAnswers", ll."currentStreak"

ORDER BY ll."currentRank" ASC, ll."currentPoints" DESC;

-- ============================================================================
-- 2. QUESTION-BY-QUESTION ANALYSIS WITH SPEED RANKINGS
-- ============================================================================
-- Shows who answered each question first, their timing, and points earned

SELECT 
    q."id" as question_id,
    q."question" as question_text,
    q."timeLimit" as time_limit_seconds,
    
    -- Answer details ordered by speed
    qs."playerId" as player_id,
    gp."name" as player_name,
    qs."answer" as submitted_answer,
    qs."rightAnswer" as correct_answer,
    qs."isRight" as is_correct,
    qs."timeTaken" as time_taken_seconds,
    qs."reactionTime" as reaction_time_ms,
    qs."point" as points_earned,
    qs."answerOrder" as answer_order, -- 1 = first to answer, 2 = second, etc.
    qs."answeredAtMs" as timestamp_ms,
    
    -- Speed ranking among correct answers only
    CASE WHEN qs."isRight" = true THEN
        ROW_NUMBER() OVER (
            PARTITION BY q."id", qs."isRight" 
            ORDER BY qs."answeredAtMs" ASC
        )
    ELSE NULL END as speed_rank_correct,
    
    -- Time advantage over next correct answer
    CASE WHEN qs."isRight" = true THEN
        qs."reactionTime" - LEAD(qs."reactionTime") OVER (
            PARTITION BY q."id" 
            ORDER BY qs."answeredAtMs" ASC
        )
    ELSE NULL END as time_advantage_ms

FROM "Questions" q
JOIN "QuestionsSolved" qs ON qs."questionId" = q."id"
JOIN "GamePlayers" gp ON gp."id" = qs."playerId"
JOIN "GameSessions" gs ON gs."gameId" = q."gameId"

WHERE gs."id" = $1  -- Replace with actual session ID
ORDER BY q."createdAt" ASC, qs."answerOrder" ASC;

-- ============================================================================
-- 3. REAL-TIME LEADERBOARD DURING GAME PROGRESSION  
-- ============================================================================
-- Shows how rankings changed throughout the game

WITH question_progression AS (
    SELECT 
        qs."playerId",
        gp."name" as player_name,
        qs."questionId",
        qs."createdAt" as answered_at,
        qs."point" as points_this_question,
        qs."isRight" as correct_this_question,
        
        -- Running totals
        SUM(qs."point") OVER (
            PARTITION BY qs."playerId" 
            ORDER BY qs."createdAt" ASC
            ROWS UNBOUNDED PRECEDING
        ) as running_total_points,
        
        SUM(CASE WHEN qs."isRight" THEN 1 ELSE 0 END) OVER (
            PARTITION BY qs."playerId" 
            ORDER BY qs."createdAt" ASC
            ROWS UNBOUNDED PRECEDING
        ) as running_correct_answers,
        
        COUNT(*) OVER (
            PARTITION BY qs."playerId" 
            ORDER BY qs."createdAt" ASC
            ROWS UNBOUNDED PRECEDING
        ) as running_questions_answered
        
    FROM "QuestionsSolved" qs
    JOIN "GamePlayers" gp ON gp."id" = qs."playerId"
    JOIN "GameSessions" gs ON gs."roomId" = gp."roomId"
    WHERE gs."id" = $1
)
SELECT 
    *,
    -- Rank at each point in time
    ROW_NUMBER() OVER (
        PARTITION BY answered_at 
        ORDER BY running_total_points DESC, running_correct_answers DESC
    ) as rank_at_this_point,
    
    -- Accuracy percentage at this point
    ROUND(
        CASE WHEN running_questions_answered > 0 
        THEN (running_correct_answers::DECIMAL / running_questions_answered * 100)
        ELSE 0 END, 2
    ) as accuracy_percentage_so_far

FROM question_progression
ORDER BY answered_at ASC, running_total_points DESC;

-- ============================================================================
-- 4. SPEED CHAMPIONS - WHO ANSWERED FIRST MOST OFTEN
-- ============================================================================
-- Analysis of who consistently answered questions first and correctly

SELECT 
    gp."id" as player_id,
    gp."name" as player_name,
    
    -- First correct answer statistics
    COUNT(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN 1 END) as first_correct_answers,
    COUNT(CASE WHEN qs."isRight" = true THEN 1 END) as total_correct_answers,
    COUNT(*) as total_questions_attempted,
    
    -- Speed metrics
    AVG(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as avg_correct_reaction_time,
    MIN(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as fastest_correct_reaction,
    
    -- Consistency metrics  
    STDDEV(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as reaction_time_consistency,
    
    -- Performance ratios
    ROUND(
        COUNT(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN qs."isRight" = true THEN 1 END), 0) * 100, 2
    ) as first_correct_percentage,
    
    -- Points from speed (bonus points for being first)
    SUM(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN qs."point" ELSE 0 END) as points_from_speed

FROM "GamePlayers" gp
JOIN "QuestionsSolved" qs ON qs."playerId" = gp."id"
JOIN "GameSessions" gs ON gs."roomId" = gp."roomId"

WHERE gs."id" = $1
GROUP BY gp."id", gp."name"
ORDER BY first_correct_answers DESC, avg_correct_reaction_time ASC;

-- ============================================================================
-- 5. GAME DIFFICULTY ANALYSIS - WHICH QUESTIONS WERE HARDEST
-- ============================================================================
-- Analyzes question difficulty based on player performance

SELECT 
    q."id" as question_id,
    q."question" as question_text,
    q."timeLimit" as time_limit,
    
    -- Answer statistics
    COUNT(qs.*) as total_attempts,
    COUNT(CASE WHEN qs."isRight" = true THEN 1 END) as correct_attempts,
    COUNT(CASE WHEN qs."isRight" = false THEN 1 END) as incorrect_attempts,
    
    -- Success rate
    ROUND(
        CASE WHEN COUNT(qs.*) > 0 
        THEN (COUNT(CASE WHEN qs."isRight" = true THEN 1 END)::DECIMAL / COUNT(qs.*) * 100)
        ELSE 0 END, 2
    ) as success_rate_percentage,
    
    -- Timing analysis
    AVG(CASE WHEN qs."isRight" = true THEN qs."timeTaken" END) as avg_time_correct,
    AVG(CASE WHEN qs."isRight" = false THEN qs."timeTaken" END) as avg_time_incorrect,
    MIN(CASE WHEN qs."isRight" = true THEN qs."timeTaken" END) as fastest_correct_time,
    
    -- Reaction time analysis  
    AVG(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as avg_reaction_correct,
    MIN(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as fastest_reaction,
    
    -- Player who answered first correctly
    (SELECT gp."name" 
     FROM "QuestionsSolved" qs2 
     JOIN "GamePlayers" gp ON gp."id" = qs2."playerId"
     WHERE qs2."questionId" = q."id" AND qs2."answerOrder" = 1 AND qs2."isRight" = true
     LIMIT 1) as first_correct_player,
     
    -- Difficulty classification
    CASE 
        WHEN COUNT(CASE WHEN qs."isRight" = true THEN 1 END)::DECIMAL / NULLIF(COUNT(qs.*), 0) >= 0.8 THEN 'EASY'
        WHEN COUNT(CASE WHEN qs."isRight" = true THEN 1 END)::DECIMAL / NULLIF(COUNT(qs.*), 0) >= 0.5 THEN 'MEDIUM'
        WHEN COUNT(CASE WHEN qs."isRight" = true THEN 1 END)::DECIMAL / NULLIF(COUNT(qs.*), 0) >= 0.2 THEN 'HARD'
        ELSE 'VERY_HARD'
    END as difficulty_level

FROM "Questions" q
LEFT JOIN "QuestionsSolved" qs ON qs."questionId" = q."id"
JOIN "GameSessions" gs ON gs."gameId" = q."gameId"

WHERE gs."id" = $1
GROUP BY q."id", q."question", q."timeLimit", q."createdAt"
ORDER BY success_rate_percentage ASC, avg_time_correct DESC;

-- ============================================================================
-- 6. COMPREHENSIVE WINNER REPORT WITH ALL METRICS
-- ============================================================================
-- Final comprehensive report for determining winners with all possible tie-breaking criteria

WITH player_comprehensive_stats AS (
    SELECT 
        gp."id" as player_id,
        gp."name" as player_name,
        gs."id" as session_id,
        
        -- Basic performance
        ll."currentPoints" as total_points,
        ll."correctAnswers" as correct_answers,  
        ll."questionsAnswered" as questions_attempted,
        ll."currentStreak" as max_streak,
        
        -- Speed metrics
        COUNT(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN 1 END) as first_correct_count,
        AVG(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as avg_reaction_time,
        MIN(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as fastest_reaction_time,
        
        -- Consistency metrics
        STDDEV(CASE WHEN qs."isRight" = true THEN qs."reactionTime" END) as reaction_consistency,
        
        -- Advanced scoring
        SUM(CASE WHEN qs."answerOrder" = 1 AND qs."isRight" = true THEN qs."point" * 1.5 ELSE qs."point" END) as weighted_score,
        
        -- Time efficiency  
        AVG(CASE WHEN qs."isRight" = true THEN (q."timeLimit" - qs."timeTaken")::DECIMAL / q."timeLimit" END) as time_efficiency,
        
        -- Accuracy rate
        CASE WHEN ll."questionsAnswered" > 0 
        THEN ll."correctAnswers"::DECIMAL / ll."questionsAnswered" 
        ELSE 0 END as accuracy_rate

    FROM "GamePlayers" gp
    JOIN "GameSessions" gs ON gs."roomId" = gp."roomId"
    LEFT JOIN "LiveLeaderboard" ll ON ll."sessionId" = gs."id" AND ll."playerId" = gp."id"
    LEFT JOIN "QuestionsSolved" qs ON qs."playerId" = gp."id"
    LEFT JOIN "Questions" q ON q."id" = qs."questionId"
    
    WHERE gs."id" = $1 AND gp."isApproved" = true
    GROUP BY gp."id", gp."name", gs."id", ll."currentPoints", ll."correctAnswers", 
             ll."questionsAnswered", ll."currentStreak"
)

SELECT 
    *,
    -- Final ranking with comprehensive tie-breaking
    ROW_NUMBER() OVER (
        ORDER BY 
            total_points DESC,                    -- Primary: Total points
            correct_answers DESC,                 -- Secondary: Number correct
            first_correct_count DESC,             -- Tertiary: Speed bonus
            avg_reaction_time ASC,                -- Quaternary: Average speed
            accuracy_rate DESC,                   -- Quinary: Accuracy
            max_streak DESC,                      -- Senary: Best streak  
            fastest_reaction_time ASC             -- Final: Fastest single reaction
    ) as final_rank,
    
    -- Winner classification
    CASE 
        WHEN ROW_NUMBER() OVER (
            ORDER BY total_points DESC, correct_answers DESC, 
                     first_correct_count DESC, avg_reaction_time ASC
        ) = 1 THEN 'GOLD_WINNER'
        WHEN ROW_NUMBER() OVER (
            ORDER BY total_points DESC, correct_answers DESC, 
                     first_correct_count DESC, avg_reaction_time ASC
        ) = 2 THEN 'SILVER_WINNER'
        WHEN ROW_NUMBER() OVER (
            ORDER BY total_points DESC, correct_answers DESC, 
                     first_correct_count DESC, avg_reaction_time ASC
        ) = 3 THEN 'BRONZE_WINNER'
        ELSE 'PARTICIPANT'
    END as winner_category,
    
    -- Performance grades
    CASE 
        WHEN accuracy_rate >= 0.9 THEN 'A+'
        WHEN accuracy_rate >= 0.8 THEN 'A'
        WHEN accuracy_rate >= 0.7 THEN 'B'
        WHEN accuracy_rate >= 0.6 THEN 'C'
        ELSE 'D'
    END as accuracy_grade,
    
    CASE 
        WHEN avg_reaction_time <= 2000 THEN 'VERY_FAST'
        WHEN avg_reaction_time <= 5000 THEN 'FAST'
        WHEN avg_reaction_time <= 10000 THEN 'AVERAGE'
        ELSE 'SLOW'
    END as speed_grade

FROM player_comprehensive_stats
ORDER BY final_rank ASC;

-- ============================================================================
-- 7. SAMPLE QUERIES FOR SPECIFIC USE CASES
-- ============================================================================

-- Get the winner of a specific game session
-- SELECT player_name, total_points, accuracy_rate 
-- FROM [above query] 
-- WHERE final_rank = 1;

-- Get all players who answered a specific question first and correctly  
-- SELECT gp."name", qs."reactionTime", qs."timeTaken"
-- FROM "QuestionsSolved" qs
-- JOIN "GamePlayers" gp ON gp."id" = qs."playerId"  
-- WHERE qs."questionId" = $1 AND qs."answerOrder" = 1 AND qs."isRight" = true;

-- Get real-time leaderboard at any point during the game
-- SELECT player_name, running_total_points, rank_at_this_point
-- FROM [query #3 above]
-- WHERE answered_at <= $1  -- specific timestamp
-- ORDER BY rank_at_this_point ASC;

-- Find the fastest reaction time across all games
-- SELECT gp."name", MIN(qs."reactionTime") as fastest_ever
-- FROM "QuestionsSolved" qs  
-- JOIN "GamePlayers" gp ON gp."id" = qs."playerId"
-- WHERE qs."isRight" = true
-- GROUP BY gp."name"
-- ORDER BY fastest_ever ASC
-- LIMIT 1;
