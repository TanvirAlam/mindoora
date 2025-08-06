// Simple webhook email service
class WebhookEmailService {
  
  async sendInvitation(data: {
    recipientEmail: string;
    senderName: string;
    gameTitle: string;
    gameCode: string;
  }): Promise<{ success: boolean; message: string }> {
    console.log('📧 Mock email invitation service - skipping actual webhook call');
    console.log('📧 Game code generated:', data.gameCode);
    console.log('📧 Recipient:', data.recipientEmail);
    console.log('📧 Sender:', data.senderName);
    
    // For testing purposes, we'll skip the actual webhook call and return success immediately
    // In production, you would replace this with a real webhook URL and actual email sending
    
    console.log('✅ Mock email invitation completed successfully');
    
    return {
      success: true,
      message: `Game code ${data.gameCode} ready! Share with ${data.recipientEmail} to invite them.`
    };
  }
}

export default new WebhookEmailService();
