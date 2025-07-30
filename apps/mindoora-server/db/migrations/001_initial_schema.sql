-- PostgreSQL Schema converted from Prisma
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMS
CREATE TYPE f_status AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'PENDING');
CREATE TYPE game_status AS ENUM ('created', 'live', 'finished', 'closed');
CREATE TYPE game_role AS ENUM ('admin', 'moderator', 'guest');

-- Create Tables

-- Register table
CREATE TABLE "Register" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    phone VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    "accessToken" VARCHAR NOT NULL,
    verified BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_register_email ON "Register"(email);

-- User table
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    image VARCHAR,
    "registerId" UUID UNIQUE NOT NULL,
    CONSTRAINT fk_user_register FOREIGN KEY ("registerId") REFERENCES "Register"(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_register_id ON "User"("registerId");

-- Followings table
CREATE TABLE "Followings" (
    id SERIAL PRIMARY KEY,
    "followingId" UUID NOT NULL,
    "followerId" UUID NOT NULL,
    CONSTRAINT fk_followings_following FOREIGN KEY ("followingId") REFERENCES "Register"(id) ON DELETE CASCADE,
    CONSTRAINT fk_followings_follower FOREIGN KEY ("followerId") REFERENCES "Register"(id) ON DELETE CASCADE,
    UNIQUE("followerId", "followingId")
);

CREATE INDEX idx_followings_follower_id ON "Followings"("followerId");
CREATE INDEX idx_followings_following_id ON "Followings"("followingId");

-- LoginHistory table (independent - no foreign key constraints)
CREATE TABLE "LoginHistory" (
    id SERIAL PRIMARY KEY,
    "loginTime" TIMESTAMP DEFAULT NOW(),
    "userId" UUID NOT NULL
    -- Note: userId can store any UUID value, no foreign key constraint
);

CREATE INDEX idx_login_history_user_id ON "LoginHistory"("userId");

-- Feedback table
CREATE TABLE "Feedback" (
    id SERIAL PRIMARY KEY,
    score INTEGER NOT NULL,
    feedback TEXT,
    "userId" UUID NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_feedback_user FOREIGN KEY ("userId") REFERENCES "Register"(id) ON DELETE CASCADE
);

CREATE INDEX idx_feedback_user_id ON "Feedback"("userId");

-- Notifications table
CREATE TABLE "Notifications" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "from" UUID NOT NULL,
    notification VARCHAR NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_notifications_from FOREIGN KEY ("from") REFERENCES "Register"(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_from ON "Notifications"("from");

-- NRecipients table
CREATE TABLE "NRecipients" (
    id SERIAL PRIMARY KEY,
    "notificationId" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    CONSTRAINT fk_nrecipients_notification FOREIGN KEY ("notificationId") REFERENCES "Notifications"(id) ON DELETE CASCADE,
    CONSTRAINT fk_nrecipients_recipient FOREIGN KEY ("recipientId") REFERENCES "Register"(id) ON DELETE CASCADE,
    UNIQUE("notificationId", "recipientId")
);

CREATE INDEX idx_nrecipients_recipient_id ON "NRecipients"("recipientId");

-- Friends table
CREATE TABLE "Friends" (
    id SERIAL PRIMARY KEY,
    "userId" UUID NOT NULL,
    "friendId" UUID NOT NULL,
    status f_status DEFAULT 'REQUESTED',
    "groupU" TEXT[] DEFAULT ARRAY['general'],
    "groupF" TEXT[] DEFAULT ARRAY['general'],
    "isFavoriteU" BOOLEAN DEFAULT false,
    "isFavoriteF" BOOLEAN DEFAULT false,
    "isPrivateU" BOOLEAN DEFAULT false,
    "isPrivateF" BOOLEAN DEFAULT false,
    "isBlockedU" BOOLEAN DEFAULT false,
    "isBlockedF" BOOLEAN DEFAULT false,
    "lastMeet" TIMESTAMP,
    "notesU" TEXT,
    "notesF" TEXT,
    metadata JSONB,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_friends_user FOREIGN KEY ("userId") REFERENCES "Register"(id) ON DELETE CASCADE,
    CONSTRAINT fk_friends_friend FOREIGN KEY ("friendId") REFERENCES "Register"(id) ON DELETE CASCADE,
    UNIQUE("userId", "friendId")
);

CREATE INDEX idx_friends_user_id ON "Friends"("userId");
CREATE INDEX idx_friends_friend_id ON "Friends"("friendId");

-- EmailVerify table
CREATE TABLE "EmailVerify" (
    id SERIAL PRIMARY KEY,
    email VARCHAR NOT NULL,
    code INTEGER NOT NULL,
    "expireAt" TIMESTAMP NOT NULL,
    "createAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_email_verify_register FOREIGN KEY (email) REFERENCES "Register"(email) ON DELETE CASCADE
);

CREATE INDEX idx_email_verify_email ON "EmailVerify"(email);

-- Languages table
CREATE TABLE "Languages" (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    "imgUrl" VARCHAR UNIQUE NOT NULL,
    "shortName" VARCHAR UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true
);

-- UserGame table
CREATE TABLE "UserGame" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    language VARCHAR NOT NULL,
    "nPlayer" INTEGER NOT NULL,
    "user" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user_game_language FOREIGN KEY (language) REFERENCES "Languages"("shortName") ON DELETE CASCADE,
    CONSTRAINT fk_user_game_register FOREIGN KEY ("user") REFERENCES "Register"(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_game_language ON "UserGame"(language);
CREATE INDEX idx_user_game_user ON "UserGame"("user");

-- UserGameDetails table
CREATE TABLE "UserGameDetails" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gameId" UUID UNIQUE NOT NULL,
    "imgUrl" VARCHAR,
    description TEXT,
    category VARCHAR DEFAULT 'none',
    theme VARCHAR DEFAULT 'none',
    "keyWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user_game_details_game FOREIGN KEY ("gameId") REFERENCES "UserGame"(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_game_details_game_id ON "UserGameDetails"("gameId");

-- Questions table
CREATE TABLE "Questions" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gameId" UUID NOT NULL,
    question VARCHAR NOT NULL,
    answer INTEGER,
    options JSONB,
    "timeLimit" INTEGER DEFAULT 60,
    "qSource" VARCHAR DEFAULT '',
    "qImage" VARCHAR,
    "qPoints" REAL,
    "qTrophy" VARCHAR,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_questions_game FOREIGN KEY ("gameId") REFERENCES "UserGame"(id) ON DELETE CASCADE,
    UNIQUE("gameId", question)
);

CREATE INDEX idx_questions_game_id ON "Questions"("gameId");

-- Images table
CREATE TABLE "Images" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "imgName" VARCHAR NOT NULL,
    "user" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_images_user FOREIGN KEY ("user") REFERENCES "Register"(id) ON DELETE CASCADE
);

CREATE INDEX idx_images_user ON "Images"("user");

-- GameRooms table
CREATE TABLE "GameRooms" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gameId" UUID NOT NULL,
    "inviteCode" VARCHAR NOT NULL,
    status game_status NOT NULL,
    "user" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "expiredAt" TIMESTAMP NOT NULL,
    CONSTRAINT fk_game_rooms_register FOREIGN KEY ("user") REFERENCES "Register"(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_rooms_user_game FOREIGN KEY ("gameId") REFERENCES "UserGame"(id) ON DELETE CASCADE
);

CREATE INDEX idx_game_rooms_user ON "GameRooms"("user");
CREATE INDEX idx_game_rooms_game_id ON "GameRooms"("gameId");

-- GamePlayers table
CREATE TABLE "GamePlayers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roomId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    "imgUrl" VARCHAR,
    role game_role NOT NULL,
    "isApproved" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_game_players_room FOREIGN KEY ("roomId") REFERENCES "GameRooms"(id) ON DELETE CASCADE,
    UNIQUE("roomId", name)
);

CREATE INDEX idx_game_players_room_id ON "GamePlayers"("roomId");

-- QuestionsSolved table
CREATE TABLE "QuestionsSolved" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "playerId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    answer VARCHAR NOT NULL,
    "rightAnswer" VARCHAR NOT NULL,
    "isRight" BOOLEAN NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    point INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_questions_solved_player FOREIGN KEY ("playerId") REFERENCES "GamePlayers"(id) ON DELETE CASCADE,
    CONSTRAINT fk_questions_solved_question FOREIGN KEY ("questionId") REFERENCES "Questions"(id) ON DELETE CASCADE,
    UNIQUE("playerId", "questionId")
);

CREATE INDEX idx_questions_solved_player_id ON "QuestionsSolved"("playerId");
CREATE INDEX idx_questions_solved_question_id ON "QuestionsSolved"("questionId");

-- userGameScore table
CREATE TABLE "userGameScore" (
    score INTEGER NOT NULL,
    "gameId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_user_game_score_game FOREIGN KEY ("gameId") REFERENCES "UserGame"(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_game_score_player FOREIGN KEY ("playerId") REFERENCES "GamePlayers"(id) ON DELETE CASCADE,
    PRIMARY KEY ("gameId", "playerId"),
    UNIQUE("gameId", "playerId")
);

CREATE INDEX idx_user_game_score_game_id ON "userGameScore"("gameId");
CREATE INDEX idx_user_game_score_player_id ON "userGameScore"("playerId");

-- GameRoomMessages table
CREATE TABLE "GameRoomMessages" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roomId" UUID NOT NULL,
    content VARCHAR NOT NULL,
    "fileUrl" VARCHAR,
    "playerId" UUID NOT NULL,
    deleted BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP,
    CONSTRAINT fk_game_room_messages_player FOREIGN KEY ("playerId") REFERENCES "GamePlayers"(id) ON DELETE CASCADE,
    CONSTRAINT fk_game_room_messages_room FOREIGN KEY ("roomId") REFERENCES "GameRooms"(id) ON DELETE CASCADE,
    UNIQUE("roomId", "playerId")
);

CREATE INDEX idx_game_room_messages_player_id ON "GameRoomMessages"("playerId");
CREATE INDEX idx_game_room_messages_room_id ON "GameRoomMessages"("roomId");

-- Subscription table
CREATE TABLE "Subscription" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL,
    "ipAdress" VARCHAR NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- FeedbackGame table
CREATE TABLE "FeedbackGame" (
    id SERIAL PRIMARY KEY,
    score INTEGER NOT NULL,
    feedback TEXT,
    "gameId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_feedback_game_game FOREIGN KEY ("gameId") REFERENCES "UserGame"(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_game_player FOREIGN KEY ("playerId") REFERENCES "GamePlayers"(id) ON DELETE CASCADE,
    UNIQUE("gameId", "playerId")
);

CREATE INDEX idx_feedback_game_game_id ON "FeedbackGame"("gameId");
CREATE INDEX idx_feedback_game_player_id ON "FeedbackGame"("playerId");

-- QuestionDB table
CREATE TABLE "QuestionDB" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR NOT NULL,
    difficulty VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    question VARCHAR UNIQUE NOT NULL,
    correct_answer VARCHAR NOT NULL,
    incorrect_answers TEXT[] NOT NULL,
    extra_incorrect_answers TEXT[] NOT NULL,
    "user" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_question_db_type ON "QuestionDB"(type);
CREATE INDEX idx_question_db_question ON "QuestionDB"(question);

-- AcceptTC table
CREATE TABLE "AcceptTC" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "timeOfAccept" TIMESTAMP DEFAULT NOW(),
    "ipAddress" VARCHAR NOT NULL,
    metadata JSONB NOT NULL,
    "user" UUID NOT NULL,
    CONSTRAINT fk_accept_tc_user FOREIGN KEY ("user") REFERENCES "Register"(id) ON DELETE CASCADE
);

-- gameExperience table
CREATE TABLE "gameExperience" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roomId" UUID NOT NULL,
    "totalQ" INTEGER NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "totalText" INTEGER NOT NULL,
    "lavelOfFun" REAL NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_game_experience_room FOREIGN KEY ("roomId") REFERENCES "GameRooms"(id) ON DELETE CASCADE
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for Friends table
CREATE TRIGGER update_friends_updated_at 
    BEFORE UPDATE ON "Friends" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

