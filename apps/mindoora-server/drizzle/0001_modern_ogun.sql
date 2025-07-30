CREATE TYPE "public"."f_status" AS ENUM('REQUESTED', 'ACCEPTED', 'REJECTED', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."game_role" AS ENUM('admin', 'moderator', 'guest');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('created', 'live', 'finished', 'closed');--> statement-breakpoint
CREATE TABLE "AcceptTC" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timeOfAccept" timestamp DEFAULT now(),
	"ipAddress" varchar NOT NULL,
	"metadata" jsonb NOT NULL,
	"user" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EmailVerify" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"code" integer NOT NULL,
	"expireAt" timestamp NOT NULL,
	"createAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"score" integer NOT NULL,
	"feedback" text,
	"userId" uuid NOT NULL,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "FeedbackGame" (
	"id" serial PRIMARY KEY NOT NULL,
	"score" integer NOT NULL,
	"feedback" text,
	"gameId" uuid NOT NULL,
	"playerId" uuid NOT NULL,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Followings" (
	"id" serial PRIMARY KEY NOT NULL,
	"followingId" uuid NOT NULL,
	"followerId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Friends" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"friendId" uuid NOT NULL,
	"status" "f_status" DEFAULT 'REQUESTED',
	"groupU" text[] DEFAULT 'general',
	"groupF" text[] DEFAULT 'general',
	"isFavoriteU" boolean DEFAULT false,
	"isFavoriteF" boolean DEFAULT false,
	"isPrivateU" boolean DEFAULT false,
	"isPrivateF" boolean DEFAULT false,
	"isBlockedU" boolean DEFAULT false,
	"isBlockedF" boolean DEFAULT false,
	"lastMeet" timestamp,
	"notesU" text,
	"notesF" text,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "GamePlayers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roomId" uuid NOT NULL,
	"name" varchar NOT NULL,
	"imgUrl" varchar,
	"role" "game_role" NOT NULL,
	"isApproved" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "GameRoomMessages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roomId" uuid NOT NULL,
	"content" varchar NOT NULL,
	"fileUrl" varchar,
	"playerId" uuid NOT NULL,
	"deleted" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "GameRooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gameId" uuid NOT NULL,
	"inviteCode" varchar NOT NULL,
	"status" "game_status" NOT NULL,
	"user" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"expiredAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"imgName" varchar NOT NULL,
	"user" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Languages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"imgUrl" varchar NOT NULL,
	"shortName" varchar NOT NULL,
	"isActive" boolean DEFAULT true,
	CONSTRAINT "Languages_name_unique" UNIQUE("name"),
	CONSTRAINT "Languages_imgUrl_unique" UNIQUE("imgUrl"),
	CONSTRAINT "Languages_shortName_unique" UNIQUE("shortName")
);
--> statement-breakpoint
CREATE TABLE "LoginHistory" (
	"id" serial PRIMARY KEY NOT NULL,
	"loginTime" timestamp DEFAULT now(),
	"userId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "NRecipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"notificationId" uuid NOT NULL,
	"recipientId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from" uuid NOT NULL,
	"notification" varchar NOT NULL,
	"isRead" boolean DEFAULT false,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "QuestionDB" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar NOT NULL,
	"difficulty" varchar NOT NULL,
	"category" varchar NOT NULL,
	"question" varchar NOT NULL,
	"correct_answer" varchar NOT NULL,
	"incorrect_answers" text[] NOT NULL,
	"extra_incorrect_answers" text[] NOT NULL,
	"user" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "QuestionDB_question_unique" UNIQUE("question")
);
--> statement-breakpoint
CREATE TABLE "Questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gameId" uuid NOT NULL,
	"question" varchar NOT NULL,
	"answer" integer,
	"options" jsonb,
	"timeLimit" integer DEFAULT 60,
	"qSource" varchar DEFAULT '',
	"qImage" varchar,
	"qPoints" real,
	"qTrophy" varchar,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "QuestionsSolved" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playerId" uuid NOT NULL,
	"questionId" uuid NOT NULL,
	"answer" varchar NOT NULL,
	"rightAnswer" varchar NOT NULL,
	"isRight" boolean NOT NULL,
	"timeTaken" integer NOT NULL,
	"timeLimit" integer NOT NULL,
	"point" integer NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Register" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"password" varchar NOT NULL,
	"role" varchar NOT NULL,
	"accessToken" varchar NOT NULL,
	"verified" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "Register_email_unique" UNIQUE("email"),
	CONSTRAINT "Register_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "Subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"ipAdress" varchar NOT NULL,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"image" varchar,
	"registerId" uuid NOT NULL,
	CONSTRAINT "User_registerId_unique" UNIQUE("registerId")
);
--> statement-breakpoint
CREATE TABLE "UserGame" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"language" varchar NOT NULL,
	"nPlayer" integer NOT NULL,
	"user" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "UserGameDetails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gameId" uuid NOT NULL,
	"imgUrl" varchar,
	"description" text,
	"category" varchar DEFAULT 'none',
	"theme" varchar DEFAULT 'none',
	"keyWords" text[] DEFAULT '{}',
	"isPublic" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "UserGameDetails_gameId_unique" UNIQUE("gameId")
);
--> statement-breakpoint
CREATE TABLE "gameExperience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roomId" uuid NOT NULL,
	"totalQ" integer NOT NULL,
	"timeTaken" integer NOT NULL,
	"totalText" integer NOT NULL,
	"lavelOfFun" real NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "userGameScore" (
	"score" integer NOT NULL,
	"gameId" uuid NOT NULL,
	"playerId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "userGameScore_gameId_playerId_pk" PRIMARY KEY("gameId","playerId")
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "AcceptTC" ADD CONSTRAINT "AcceptTC_user_Register_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_Register_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FeedbackGame" ADD CONSTRAINT "FeedbackGame_gameId_UserGame_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."UserGame"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FeedbackGame" ADD CONSTRAINT "FeedbackGame_playerId_GamePlayers_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."GamePlayers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Followings" ADD CONSTRAINT "Followings_followingId_Register_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Followings" ADD CONSTRAINT "Followings_followerId_Register_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_userId_Register_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_friendId_Register_id_fk" FOREIGN KEY ("friendId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GamePlayers" ADD CONSTRAINT "GamePlayers_roomId_GameRooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."GameRooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GameRoomMessages" ADD CONSTRAINT "GameRoomMessages_roomId_GameRooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."GameRooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GameRoomMessages" ADD CONSTRAINT "GameRoomMessages_playerId_GamePlayers_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."GamePlayers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GameRooms" ADD CONSTRAINT "GameRooms_gameId_UserGame_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."UserGame"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GameRooms" ADD CONSTRAINT "GameRooms_user_Register_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Images" ADD CONSTRAINT "Images_user_Register_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NRecipients" ADD CONSTRAINT "NRecipients_notificationId_Notifications_id_fk" FOREIGN KEY ("notificationId") REFERENCES "public"."Notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "NRecipients" ADD CONSTRAINT "NRecipients_recipientId_Register_id_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_from_Register_id_fk" FOREIGN KEY ("from") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_gameId_UserGame_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."UserGame"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuestionsSolved" ADD CONSTRAINT "QuestionsSolved_playerId_GamePlayers_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."GamePlayers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "QuestionsSolved" ADD CONSTRAINT "QuestionsSolved_questionId_Questions_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."Questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_registerId_Register_id_fk" FOREIGN KEY ("registerId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserGame" ADD CONSTRAINT "UserGame_language_Languages_shortName_fk" FOREIGN KEY ("language") REFERENCES "public"."Languages"("shortName") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserGame" ADD CONSTRAINT "UserGame_user_Register_id_fk" FOREIGN KEY ("user") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserGameDetails" ADD CONSTRAINT "UserGameDetails_gameId_UserGame_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."UserGame"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameExperience" ADD CONSTRAINT "gameExperience_roomId_GameRooms_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."GameRooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userGameScore" ADD CONSTRAINT "userGameScore_gameId_UserGame_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."UserGame"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userGameScore" ADD CONSTRAINT "userGameScore_playerId_GamePlayers_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."GamePlayers"("id") ON DELETE cascade ON UPDATE no action;