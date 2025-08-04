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
  status: 'live' | 'finished' | 'closed' | 'created';
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
      
      const response = await fetch(`${this.baseUrl}/gamePlayerOpen/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${this.baseUrl}/gamePlayerOpen/allplayer?roomId=${roomId}&playerId=${playerId}`, {
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
      const response = await fetch(`${this.baseUrl}/gamePlayerOpen/result?roomId=${roomId}&playerId=${playerId}`, {
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
      const response = await fetch(`${this.baseUrl}/gameRoom/create`, {
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
      const response = await fetch(`${this.baseUrl}/gameRoom/one?id=${roomId}`, {
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

  // Update game room status
  async updateGameRoomStatus(roomId: string, status: 'live' | 'finished' | 'closed' | 'created') {
    try {
      const response = await fetch(`${this.baseUrl}/gameRoom/update`, {
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
}

export default new GameService();
