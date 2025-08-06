# GameRoom System API Documentation

This document describes the enhanced GameRoom system for the quiz game application.

## Overview

The GameRoom system allows users to create game rooms with 4-digit invite codes, join games using these codes, and manage game sessions with proper status tracking.

## Game Room Statuses

- **waiting**: Room is created and waiting for players to join
- **started**: Game has been started by the admin, no more players can join
- **live**: Game is actively running
- **finished**: Game has completed
- **closed**: Room is closed and inactive

## API Endpoints

### 1. Create Game Room
**POST** `/api/v1/gameroom/create`

Creates a new game room with a unique 4-digit invite code.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "gameId": "uuid-of-game"
}
```

**Response:**
```json
{
  "message": "Game Room Created successfully",
  "roomId": "room-uuid",
  "inviteCode": "1234",
  "name": "Player Name",
  "allPlayers": [...]
}
```

### 2. Join Game Room
**POST** `/api/gamePlayerOpen/create`

Allows a player to join a game room using the 4-digit invite code.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "inviteCode": "1234",
  "name": "Player Name"
}
```

**Response:**
```json
{
  "message": "Game player Created.",
  "player": {
    "id": "player-uuid",
    "roomId": "room-uuid",
    "name": "Player Name",
    "role": "guest",
    "isApproved": false
  },
  "gameId": "game-uuid",
  "allPlayer": [...]
}
```

### 3. Get Players by Invite Code
**GET** `/api/gamePlayerOpen/players-by-code?inviteCode=1234`

Mobile-friendly API to get all players in a room using just the invite code.

**Response:**
```json
{
  "message": "Got all players successfully",
  "result": {
    "room": {
      "id": "room-uuid",
      "status": "waiting",
      "inviteCode": "1234",
      "expiredAt": "2024-01-01T12:30:00Z"
    },
    "players": [
      {
        "id": "player-uuid",
        "name": "Player Name",
        "imgUrl": "profile-image-url",
        "role": "admin",
        "isApproved": true,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### 4. Start Game
**POST** `/api/v1/gameroom/start`

Starts the game (only room admin can call this). Changes status from "waiting" to "started".

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "roomId": "room-uuid"
}
```

**Response:**
```json
{
  "message": "Game started successfully",
  "result": {
    "gameRoom": {
      "id": "room-uuid",
      "status": "started",
      "inviteCode": "1234",
      ...
    }
  }
}
```

### 5. Get Room Players (Legacy)
**GET** `/api/gamePlayerOpen/allplayer?roomId={roomId}&playerId={playerId}`

Gets all approved players in a room (requires player to be approved).

### 6. Get Game Results
**GET** `/api/gamePlayerOpen/result?roomId={roomId}&playerId={playerId}`

Gets final game results for a finished room.

## Key Features

### 1. 4-Digit Invite Codes
- All invite codes are exactly 4 digits (1000-9999)
- Unique across all active rooms
- Easy for mobile users to type and share

### 2. Room Expiration
- Rooms expire 30 minutes after creation if not started
- Expired rooms cannot be joined
- Prevents stale rooms from accumulating

### 3. Status Management
- **waiting** → **started** → **live** → **finished**
- Only waiting rooms can be joined
- Only room admin can start games
- Proper status validation throughout

### 4. Mobile-Friendly
- `/players-by-code` endpoint optimized for mobile apps
- Simple invite code sharing workflow
- Fast response times

## Database Schema

### GameRooms Table
```sql
CREATE TABLE "GameRooms" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "gameId" UUID NOT NULL,
    "inviteCode" VARCHAR(4) NOT NULL,
    status game_status NOT NULL, -- 'waiting', 'started', 'live', 'finished', 'closed'
    "user" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "expiredAt" TIMESTAMP NOT NULL
);
```

### GamePlayers Table
```sql
CREATE TABLE "GamePlayers" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "roomId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    "imgUrl" VARCHAR,
    role game_role NOT NULL, -- 'admin', 'guest'
    "isApproved" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

- **404**: Room not found or already started
- **400**: Invalid request (expired room, wrong status)
- **403**: Access denied (not room admin)
- **500**: Server error

## Migration

Run the migration to add new statuses:
```sql
-- Run: db/migrations/008_update_game_status_enum.sql
ALTER TYPE game_status ADD VALUE IF NOT EXISTS 'waiting';
ALTER TYPE game_status ADD VALUE IF NOT EXISTS 'started';
UPDATE "GameRooms" SET status = 'waiting' WHERE status = 'created';
```

## Usage Examples

### Mobile App Flow
1. User creates room → gets 4-digit code
2. Share code with friends
3. Friends join using code
4. Admin sees player list and starts game
5. Game begins, no more joins allowed

### React Native Integration
```typescript
import gameService from './services/gameService';

// Create room
const room = await gameService.createGameRoom(gameId);
console.log('Share this code:', room.inviteCode);

// Join room
await gameService.joinGame({ inviteCode: '1234', name: 'Player' });

// Get players for lobby
const { room, players } = await gameService.getPlayersByInviteCode('1234');

// Start game (admin only)
await gameService.startGame(roomId);
```
