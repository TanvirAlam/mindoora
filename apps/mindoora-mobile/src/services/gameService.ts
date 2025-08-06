import authService from './auth/authService';

export interface JoinGameRequest {
  inviteCode: string;
  name: string;
}

export interface JoinGameResponse {
  success: boolean;
  data?: {
    player: {
      id: string;
      roomId: string;
      name: string;
      role: string;
      isApproved: boolean;
    };
    gameId: string;
    allPlayer: Array<{
      id: string;
      roomId: string;
      name: string;
      role: string;
      isApproved: boolean;
      imgUrl?: string;
    }>;
  };
  message?: string;
  error?: string;
}

export interface GameRoom {
  id: string;
  gameId: string;
  status: 'waiting' | 'started' | 'live' | 'finished' | 'closed' | 'created';
  inviteCode: string;
  user: string;
  expiredAt: string;
  createdAt: string;
}

export interface GamePlayer {
  id: string;
  roomId: string;
  name: string;
  imgUrl?: string;
  role: 'admin' | 'guest';
  isApproved: boolean;
}

class GameService {
  private baseUrl = 'http://localhost:8080/api';

  private getAuthHeaders() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.accessToken) {
      throw new Error('User is not authenticated');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentUser.accessToken}`
    };
  }

  // Join a game using invite code
  async joinGame(request: JoinGameRequest): Promise<JoinGameResponse> {
    try {
      console.log('🎮 Joining game with code:', request.inviteCode);
      
      const response = await fetch(`${this.baseUrl}/v1/ogameplayer/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      console.log('🎮 Join game response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🎮 Join game error:', errorData);
        
        if (response.status === 404) {
          throw new Error(errorData.message || 'Game room not found. Please check your code and try again.');
        }
        
        throw new Error(errorData.message || `Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🎮 Successfully joined game:', result);
      
      return {
        success: true,
        data: result,
        message: result.message
      };
    } catch (error) {
      console.error('🎮 Error joining game:', error);
      
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      throw error;
    }
  }

  // Get all players in a room
  async getRoomPlayers(roomId: string, playerId: string): Promise<GamePlayer[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/ogameplayer/allplayer?roomId=${roomId}&playerId=${playerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.result?.allPlayers || [];
    } catch (error) {
      console.error('Error fetching room players:', error);
      throw error;
    }
  }

  // Get game results for a room
  async getGameResults(roomId: string, playerId: string): Promise<Array<{
    playerName: string;
    image?: string;
    nQuestionSolved: number;
    rightAnswered: number;
    points: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/ogameplayer/result?roomId=${roomId}&playerId=${playerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.result || [];
    } catch (error) {
      console.error('Error fetching game results:', error);
      throw error;
    }
  }

  // Create a game room (for authenticated users)
  async createGameRoom(gameId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/gameroom/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ gameId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating game room:', error);
      throw error;
    }
  }

  // Get game room by ID
  async getGameRoom(roomId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/gameroom/one?id=${roomId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.result?.gameRoom;
    } catch (error) {
      console.error('Error fetching game room:', error);
      throw error;
    }
  }

  // Get players by invite code (mobile-friendly API)
  async getPlayersByInviteCode(inviteCode: string): Promise<{
    room: {
      id: string;
      status: string;
      inviteCode: string;
      expiredAt: string;
    };
    players: GamePlayer[];
  }> {
    try {
      console.log('🔍 Looking up room by invite code:', inviteCode);
      
      // Try with authentication first (for verification purposes)
      let headers = {
        'Content-Type': 'application/json',
      };
      
      try {
        const authHeaders = this.getAuthHeaders();
        headers = { ...headers, ...authHeaders };
        console.log('🔍 Using authenticated request for room lookup');
      } catch (authError) {
        console.log('🔍 No authentication available, trying unauthenticated request');
      }
      
      const response = await fetch(`${this.baseUrl}/v1/ogameplayer/players-by-code?inviteCode=${inviteCode}`, {
        method: 'GET',
        headers
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.error('🔍 Raw error response:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('🔍 Failed to parse error response as JSON');
          errorData = { message: responseText || `HTTP ${response.status} error` };
        }
        
        console.error('🔍 Parsed error response:', errorData);
        throw new Error(errorData.message || `Game room not found with code ${inviteCode}`);
      }

      const result = await response.json();
      console.log('🔍 Found room details:', result.result);
      return result.result;
    } catch (error) {
      console.error('❌ Error fetching players by invite code:', error);
      throw error;
    }
  }

  // Start a game (only for room admin)
  async startGame(roomId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/gameroom/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ roomId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.result?.gameRoom;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  // Update game room status
  async updateGameRoomStatus(roomId: string, status: 'waiting' | 'started' | 'live' | 'finished' | 'closed') {
    try {
      const response = await fetch(`${this.baseUrl}/v1/gameroom/update`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id: roomId, status })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.result?.gameRoom;
    } catch (error) {
      console.error('Error updating game room status:', error);
      throw error;
    }
  }

  // Submit player answer with timing
  async submitAnswer(roomId: string, playerId: string, questionId: string, answer: number, timeToAnswer: number) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/questionsolved/create`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          playerId,
          questionId, 
          answer, 
          timeTaken: timeToAnswer 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  // Get real-time game progress for all players
  async getGameProgress(roomId: string): Promise<{
    players: Array<{
      id: string;
      name: string;
      imgUrl?: string;
      currentQuestion: number;
      score: number;
      isAnswered: boolean;
      answerTime?: number;
      isOnline: boolean;
    }>;
    currentQuestion: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/ogameplayer/progress?roomId=${roomId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.result || { players: [], currentQuestion: 0 };
    } catch (error) {
      console.error('Error fetching game progress:', error);
      // Return empty data instead of throwing to prevent breaking the game
      return { players: [], currentQuestion: 0 };
    }
  }
}

export default new GameService();
