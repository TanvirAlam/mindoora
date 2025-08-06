import authService from './auth/authService';
import emailService from './emailService';
import simpleEmailService from './simpleEmailService';
import freeEmailService from './freeEmailService';
import webhookEmailService from './webhookEmailService';

export interface GameInvitation {
  id: string;
  gameId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientEmail: string;
  recipientName?: string;
  gameTitle: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  sentAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export interface InvitePlayerRequest {
  gameId: string;
  recipientEmail: string;
  gameCode: string;
  message?: string;
}

export interface InvitationResponse {
  invitation: GameInvitation;
  success: boolean;
  message?: string;
}

class InvitationService {
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

  // Send invitation to a player using webhook email service
  async sendInvitation(request: InvitePlayerRequest): Promise<InvitationResponse> {
    try {
      console.log('Sending invitation via webhook email service:', request);
      
      // Get current user info
      const currentUser = authService.getCurrentUser();
      const senderName = 'tanvir.alam.shawn@gmail.com'; // Override with specific email
      
      // Try sending email using webhook email service first
      let emailResult = await webhookEmailService.sendInvitation({
        recipientEmail: request.recipientEmail,
        senderName: senderName,
        gameTitle: `Game (${request.gameCode})`, // Using game code as title for now
        gameCode: request.gameCode
      });
      
      // If webhook service fails, try the free email service as fallback
      if (!emailResult.success) {
        console.log('🔄 Trying fallback free email service...');
        emailResult = await freeEmailService.sendInvitation({
          recipientEmail: request.recipientEmail,
          senderName: senderName,
          gameTitle: `Game (${request.gameCode})`,
          gameCode: request.gameCode
        });
      }

      if (emailResult.success) {
        console.log('✅ Email invitation sent successfully');
        
        // Return success response with mock invitation data
        return {
          success: true,
          message: 'Invitation sent successfully!',
          invitation: {
            id: `free-email-${Date.now()}`,
            gameId: request.gameId,
            senderId: currentUser?.uid || 'current-user',
            senderName: senderName,
            recipientId: 'unknown',
            recipientEmail: request.recipientEmail,
            gameTitle: `Game (${request.gameCode})`,
            status: 'pending',
            sentAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          }
        };
      } else {
        throw new Error(emailResult.message || 'Failed to send email invitation');
      }
      
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
      throw new Error('Failed to send invitation. Please try again.');
    }
  }

  // Get all invitations sent by current user for a specific game
  async getSentInvitations(gameId: string): Promise<GameInvitation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/sent?gameId=${gameId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.data?.invitations || [];
    } catch (error) {
      console.error('Error fetching sent invitations:', error);
      throw error;
    }
  }

  // Get all invitations received by current user
  async getReceivedInvitations(): Promise<GameInvitation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/received`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.data?.invitations || [];
    } catch (error) {
      console.error('Error fetching received invitations:', error);
      throw error;
    }
  }

  // Respond to an invitation (accept/reject)
  async respondToInvitation(invitationId: string, response: 'accept' | 'reject'): Promise<void> {
    try {
      const httpResponse = await fetch(`${this.baseUrl}/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ response })
      });

      if (!httpResponse.ok) {
        const errorData = await httpResponse.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${httpResponse.status} error`);
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      throw error;
    }
  }

  // Cancel a sent invitation
  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/invitations/${invitationId}/cancel`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }
    } catch (error) {
      console.error('Error canceling invitation:', error);
      throw error;
    }
  }

  // Get invitation status summary for a game
  async getInvitationsSummary(gameId: string): Promise<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    expired: number;
  }> {
    try {
      const invitations = await this.getSentInvitations(gameId);
      
      return {
        total: invitations.length,
        pending: invitations.filter(inv => inv.status === 'pending').length,
        accepted: invitations.filter(inv => inv.status === 'accepted').length,
        rejected: invitations.filter(inv => inv.status === 'rejected').length,
        expired: invitations.filter(inv => inv.status === 'expired').length,
      };
    } catch (error) {
      console.error('Error getting invitations summary:', error);
      return { total: 0, pending: 0, accepted: 0, rejected: 0, expired: 0 };
    }
  }

  // Search for users by email (for invitation suggestions)
  async searchUsers(query: string): Promise<Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      return result.data?.users || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

export default new InvitationService();
