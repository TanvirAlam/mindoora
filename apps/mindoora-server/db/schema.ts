import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  integer,
  serial,
  text,
  jsonb,
  real,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";

export const fStatus = pgEnum("f_status", [
  "REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "PENDING",
]);
export const gameStatus = pgEnum("game_status", [
  "created",
  "live",
  "finished",
  "closed",
]);
export const gameRole = pgEnum("game_role", ["admin", "moderator", "guest"]);

export const Register = pgTable("Register", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone").notNull().unique(),
  password: varchar("password").notNull(),
  role: varchar("role").notNull(),
  accessToken: varchar("accessToken").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const User = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  image: varchar("image"),
  registerId: uuid("registerId")
    .notNull()
    .unique()
    .references(() => Register.id, { onDelete: "cascade" }),
});

export const Followings = pgTable("Followings", {
  id: serial("id").primaryKey(),
  followingId: uuid("followingId")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  followerId: uuid("followerId")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
});

export const LoginHistory = pgTable("LoginHistory", {
  id: serial("id").primaryKey(),
  loginTime: timestamp("loginTime").defaultNow(),
  userId: uuid("userId").notNull(),
});

export const Feedback = pgTable("Feedback", {
  id: serial("id").primaryKey(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  userId: uuid("userId")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const Notifications = pgTable("Notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  from: uuid("from")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  notification: varchar("notification").notNull(),
  isRead: boolean("isRead").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const NRecipients = pgTable("NRecipients", {
  id: serial("id").primaryKey(),
  notificationId: uuid("notificationId")
    .notNull()
    .references(() => Notifications.id, { onDelete: "cascade" }),
  recipientId: uuid("recipientId")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
});

export const Friends = pgTable("Friends", {
  id: serial("id").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  friendId: uuid("friendId")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  status: fStatus("status").default("REQUESTED"),
  groupU: text("groupU").array().default(["general"]),
  groupF: text("groupF").array().default(["general"]),
  isFavoriteU: boolean("isFavoriteU").default(false),
  isFavoriteF: boolean("isFavoriteF").default(false),
  isPrivateU: boolean("isPrivateU").default(false),
  isPrivateF: boolean("isPrivateF").default(false),
  isBlockedU: boolean("isBlockedU").default(false),
  isBlockedF: boolean("isBlockedF").default(false),
  lastMeet: timestamp("lastMeet"),
  notesU: text("notesU"),
  notesF: text("notesF"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const EmailVerify = pgTable("EmailVerify", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  code: integer("code").notNull(),
  expireAt: timestamp("expireAt").notNull(),
  createAt: timestamp("createAt").defaultNow(),
});

export const Languages = pgTable("Languages", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  imgUrl: varchar("imgUrl").notNull().unique(),
  shortName: varchar("shortName").notNull().unique(),
  isActive: boolean("isActive").default(true),
});

export const UserGame = pgTable("UserGame", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  language: varchar("language")
    .notNull()
    .references(() => Languages.shortName, { onDelete: "cascade" }),
  nPlayer: integer("nPlayer").notNull(),
  user: uuid("user")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const UserGameDetails = pgTable("UserGameDetails", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("gameId")
    .notNull()
    .unique()
    .references(() => UserGame.id, { onDelete: "cascade" }),
  imgUrl: varchar("imgUrl"),
  description: text("description"),
  category: varchar("category").default("none"),
  theme: varchar("theme").default("none"),
  keyWords: text("keyWords").array().default([]),
  isPublic: boolean("isPublic").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const Questions = pgTable("Questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("gameId")
    .notNull()
    .references(() => UserGame.id, { onDelete: "cascade" }),
  question: varchar("question").notNull(),
  answer: integer("answer"),
  options: jsonb("options"),
  timeLimit: integer("timeLimit").default(60),
  qSource: varchar("qSource").default(""),
  qImage: varchar("qImage"),
  qPoints: real("qPoints"),
  qTrophy: varchar("qTrophy"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const Images = pgTable("Images", {
  id: uuid("id").primaryKey().defaultRandom(),
  imgName: varchar("imgName").notNull(),
  user: uuid("user")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const GameRooms = pgTable("GameRooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("gameId")
    .notNull()
    .references(() => UserGame.id, { onDelete: "cascade" }),
  inviteCode: varchar("inviteCode").notNull(),
  status: gameStatus("status").notNull(),
  user: uuid("user")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  expiredAt: timestamp("expiredAt").notNull(),
});

export const GamePlayers = pgTable("GamePlayers", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("roomId")
    .notNull()
    .references(() => GameRooms.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  imgUrl: varchar("imgUrl"),
  role: gameRole("role").notNull(),
  isApproved: boolean("isApproved").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const QuestionsSolved = pgTable("QuestionsSolved", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("playerId")
    .notNull()
    .references(() => GamePlayers.id, { onDelete: "cascade" }),
  questionId: uuid("questionId")
    .notNull()
    .references(() => Questions.id, { onDelete: "cascade" }),
  answer: varchar("answer").notNull(),
  rightAnswer: varchar("rightAnswer").notNull(),
  isRight: boolean("isRight").notNull(),
  timeTaken: integer("timeTaken").notNull(),
  timeLimit: integer("timeLimit").notNull(),
  point: integer("point").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const userGameScore = pgTable(
  "userGameScore",
  {
    score: integer("score").notNull(),
    gameId: uuid("gameId")
      .notNull()
      .references(() => UserGame.id, { onDelete: "cascade" }),
    playerId: uuid("playerId")
      .notNull()
      .references(() => GamePlayers.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gameId, t.playerId] }),
  })
);

export const GameRoomMessages = pgTable("GameRoomMessages", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("roomId")
    .notNull()
    .references(() => GameRooms.id, { onDelete: "cascade" }),
  content: varchar("content").notNull(),
  fileUrl: varchar("fileUrl"),
  playerId: uuid("playerId")
    .notNull()
    .references(() => GamePlayers.id, { onDelete: "cascade" }),
  deleted: boolean("deleted").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
});

export const Subscription = pgTable("Subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull(),
  ipAdress: varchar("ipAdress").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const FeedbackGame = pgTable("FeedbackGame", {
  id: serial("id").primaryKey(),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  gameId: uuid("gameId")
    .notNull()
    .references(() => UserGame.id, { onDelete: "cascade" }),
  playerId: uuid("playerId")
    .notNull()
    .references(() => GamePlayers.id, { onDelete: "cascade" }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const QuestionDB = pgTable("QuestionDB", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type").notNull(),
  difficulty: varchar("difficulty").notNull(),
  category: varchar("category").notNull(),
  question: varchar("question").notNull().unique(),
  correct_answer: varchar("correct_answer").notNull(),
  incorrect_answers: text("incorrect_answers").array().notNull(),
  extra_incorrect_answers: text("extra_incorrect_answers").array().notNull(),
  user: varchar("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const AcceptTC = pgTable("AcceptTC", {
  id: uuid("id").primaryKey().defaultRandom(),
  timeOfAccept: timestamp("timeOfAccept").defaultNow(),
  ipAddress: varchar("ipAddress").notNull(),
  metadata: jsonb("metadata").notNull(),
  user: uuid("user")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
});

export const gameExperience = pgTable("gameExperience", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("roomId")
    .notNull()
    .references(() => GameRooms.id, { onDelete: "cascade" }),
  totalQ: integer("totalQ").notNull(),
  timeTaken: integer("timeTaken").notNull(),
  totalText: integer("totalText").notNull(),
  lavelOfFun: real("lavelOfFun").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const GameWinners = pgTable("GameWinners", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("gameId")
    .notNull()
    .references(() => UserGame.id, { onDelete: "cascade" }),
  firstPlacePlayerId: uuid("firstPlacePlayerId")
    .references(() => GamePlayers.id, { onDelete: "set null" }),
  secondPlacePlayerId: uuid("secondPlacePlayerId")
    .references(() => GamePlayers.id, { onDelete: "set null" }),
  thirdPlacePlayerId: uuid("thirdPlacePlayerId")
    .references(() => GamePlayers.id, { onDelete: "set null" }),
  firstPlaceTrophy: varchar("firstPlaceTrophy"), // Trophy image URL/name for 1st place
  secondPlaceTrophy: varchar("secondPlaceTrophy"), // Trophy image URL/name for 2nd place
  thirdPlaceTrophy: varchar("thirdPlaceTrophy"), // Trophy image URL/name for 3rd place
  firstPlacePoints: integer("firstPlacePoints").default(20), // 20/20 points for 1st place
  secondPlacePoints: integer("secondPlacePoints").default(15), // 15/20 points for 2nd place
  thirdPlacePoints: integer("thirdPlacePoints").default(10), // 10/20 points for 3rd place
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const trophyRank = pgEnum("trophy_rank", [
  "bronze",
  "silver", 
  "gold",
  "platinum"
]);

export const UserTrophies = pgTable("UserTrophies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  trophyRank: trophyRank("trophyRank").notNull().default("bronze"),
  imageSrc: varchar("imageSrc").notNull(), // Image filename stored in /assets/users/
  userId: uuid("userId")
    .notNull()
    .references(() => Register.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
