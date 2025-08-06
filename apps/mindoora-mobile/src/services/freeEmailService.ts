// Free email service using multiple providers
class FreeEmailService {
  
  async sendInvitation(data: {
    recipientEmail: string;
    senderName: string;
    gameTitle: string;
    gameCode: string;
  }): Promise<{ success: boolean; message: string }> {
    // Try simple FormSubmit approach first
    try {
      return await this.sendViaSimpleFormSubmit(data);
    } catch (error) {
      console.log('🔄 Simple FormSubmit failed, trying Web3Forms...');
      try {
        return await this.sendViaWeb3Forms(data);
      } catch (web3Error) {
        console.log('🔄 Web3Forms failed, trying original FormSubmit...');
        return await this.sendViaFormSubmit(data);
      }
    }
  }

  private async sendViaSimpleFormSubmit(data: {
    recipientEmail: string;
    senderName: string;
    gameTitle: string;
    gameCode: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Simple approach - just send the essential data
      const formData = new FormData();
      formData.append('name', data.senderName);
      formData.append('email', 'noreply@mindoora.com'); // From email
      formData.append('subject', `Game Invitation: ${data.gameCode}`);
      formData.append('message', `Hi! ${data.senderName} invited you to play "${data.gameTitle}" on Mindoora. Game code: ${data.gameCode}`);
      formData.append('_replyto', data.recipientEmail); // This will send TO the recipient
      formData.append('_subject', `🎮 Game Invitation from ${data.senderName}`);
      formData.append('_next', 'https://mindoora.com/thank-you');
      formData.append('_captcha', 'false');

      console.log('📧 Sending simple FormSubmit email to:', data.recipientEmail);

      const response = await fetch('https://formsubmit.co/ajax/' + data.recipientEmail, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData,
      });

      const result = await response.json();
      console.log('📧 Simple FormSubmit response:', result);

      if (response.ok && result.success) {
        console.log('✅ Email sent successfully via Simple FormSubmit');
        return {
          success: true,
          message: 'Invitation sent successfully!'
        };
      } else {
        throw new Error(result.message || 'Simple FormSubmit failed');
      }

    } catch (error) {
      console.error('❌ Simple FormSubmit error:', error);
      throw error;
    }
  }

  private async sendViaWeb3Forms(data: {
    recipientEmail: string;
    senderName: string;
    gameTitle: string;
    gameCode: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const emailContent = `
🎮 You're Invited to Join a Mindoora Game!

Hi there!

${data.senderName} has invited you to join their quiz game "${data.gameTitle}" on Mindoora!

🎯 Game Details:
• Game: ${data.gameTitle}
• Game Code: ${data.gameCode}

📝 How to Join:
1. Open the Mindoora app on your device
2. Enter the game code: ${data.gameCode}
3. Join the game and start playing!

Don't have the Mindoora app yet? Download it and create your account to join the quiz!

Happy gaming! 🎮
The Mindoora Team
      `.trim();

      const formData = new FormData();
      formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY'); // You'll need to get this from web3forms.com
      formData.append('subject', `🎮 You're invited to play "${data.gameTitle}" on Mindoora!`);
      formData.append('email', data.recipientEmail);
      formData.append('message', emailContent);
      formData.append('from_name', data.senderName);
      formData.append('to_name', 'Game Player');

      console.log('📧 Sending email via Web3Forms to:', data.recipientEmail);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('📧 Web3Forms response:', result);

      if (result.success) {
        console.log('✅ Email sent successfully via Web3Forms');
        return {
          success: true,
          message: 'Invitation sent successfully!'
        };
      } else {
        throw new Error(result.message || 'Web3Forms failed');
      }

    } catch (error) {
      console.error('❌ Web3Forms error:', error);
      throw error;
    }
  }

  private async sendViaFormSubmit(data: {
    recipientEmail: string;
    senderName: string;
    gameTitle: string;
    gameCode: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const emailContent = `
🎮 You're Invited to Join a Mindoora Game!

Hi there!

${data.senderName} has invited you to join their quiz game "${data.gameTitle}" on Mindoora!

🎯 Game Details:
• Game: ${data.gameTitle}
• Game Code: ${data.gameCode}

📝 How to Join:
1. Open the Mindoora app on your device
2. Enter the game code: ${data.gameCode}
3. Join the game and start playing!

Don't have the Mindoora app yet? Download it and create your account to join the quiz!

Happy gaming! 🎮
The Mindoora Team
      `.trim();

      // Using FormSubmit.co - a free form-to-email service
      const formData = new FormData();
      formData.append('email', data.recipientEmail);
      formData.append('subject', `🎮 You're invited to play "${data.gameTitle}" on Mindoora!`);
      formData.append('message', emailContent);
      formData.append('_next', 'https://mindoora.com/thank-you'); // Redirect after submission
      formData.append('_captcha', 'false'); // Disable captcha
      formData.append('_template', 'table'); // Use table template

      console.log('📧 Sending email via FormSubmit to:', data.recipientEmail);

      // Using a FormSubmit endpoint - you can use any email address here
      // The email will be sent TO the recipientEmail FROM noreply@formsubmit.co
      const response = await fetch(`https://formsubmit.co/${data.recipientEmail}`, {
        method: 'POST',
        body: formData,
      });

      console.log('📧 FormSubmit response status:', response.status);

      // FormSubmit often returns HTML, so we check status code
      if (response.ok) {
        console.log('✅ Email sent successfully via FormSubmit');
        return {
          success: true,
          message: 'Invitation sent successfully!'
        };
      } else {
        const responseText = await response.text();
        console.error('❌ FormSubmit error:', responseText);
        throw new Error(`FormSubmit error: ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Failed to send email via FormSubmit:', error);
      
      // Final fallback - return instructions for manual sharing
      return {
        success: false,
        message: `Could not send email automatically. Please share this game code manually: ${data.gameCode}`
      };
    }
  }
}

export default new FreeEmailService();
