import io, { Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:8080'; // Same as the backend server

  // Connect to the socket server
  connect(): void {
    if (this.socket && this.socket.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    console.log('🔌 Connecting to socket server:', this.serverUrl);
    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      forceNew: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });
  }

  // Disconnect from the socket server
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a game room
  joinRoom(roomId: string, playerId: string): void {
    if (this.socket) {
      console.log('🎮 Joining room:', roomId, 'as player:', playerId);
      this.socket.emit('join_room', { roomId, playerId });
    }
  }

  // Leave a game room
  leaveRoom(roomId: string): void {
    if (this.socket) {
      console.log('🎮 Leaving room:', roomId);
      this.socket.emit('leave_room', { roomId });
    }
  }

  // Listen for game started event
  onGameStarted(callback: (data: { id: string; status: string }) => void): void {
    if (this.socket) {
      console.log('🎮 Listening for game_started event');
      this.socket.on('game_started', callback);
    }
  }

  // Listen for game status changes
  onGameStatus(callback: (data: { id: string; status: string }) => void): void {
    if (this.socket) {
      console.log('🎮 Listening for game_status event');
      this.socket.on('game_status', callback);
    }
  }

  // Listen for players response (when players join/leave)
  onPlayersResponse(callback: (players: any[]) => void): void {
    if (this.socket) {
      console.log('🎮 Listening for players_response event');
      this.socket.on('players_response', callback);
    }
  }

  // Remove event listeners
  offGameStarted(): void {
    if (this.socket) {
      this.socket.off('game_started');
    }
  }

  offGameStatus(): void {
    if (this.socket) {
      this.socket.off('game_status');
    }
  }

  offPlayersResponse(): void {
    if (this.socket) {
      this.socket.off('players_response');
    }
  }

  // Get socket connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
