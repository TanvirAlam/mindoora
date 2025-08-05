// Simple email service using EmailJS Web API directly
class SimpleEmailService {
  
  async sendInvitation(data: {
    recipientEmail: string;
    senderName: string;
    gameTitle: string;
    gameCode: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const templateParams = {
        service_id: 'service_fa1c15q',
        template_id: 'template_invitation',
        user_id: 'ZG6OoF7DuVfn9LE92',
        template_params: {
          to_email: data.recipientEmail,
          to_name: 'Game Player',
          from_name: data.senderName,
          game_title: data.gameTitle,
          game_code: data.gameCode,
          message: `${data.senderName} has invited you to join their quiz game "${data.gameTitle}" on Mindoora! Use game code: ${data.gameCode}`,
        }
      };

      console.log('📧 Sending email via fetch API with params:', templateParams);

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateParams),
      });

      console.log('📧 Email API response status:', response.status);

      if (response.ok) {
        const result = await response.text();
        console.log('✅ Email sent successfully:', result);
        return {
          success: true,
          message: 'Invitation sent successfully!'
        };
      } else {
        const errorText = await response.text();
        console.error('❌ Email API error:', errorText);
        throw new Error(`Email API error: ${response.status} - ${errorText}`);
      }

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        message: `Failed to send invitation: ${error.message}`
      };
    }
  }
}

export default new SimpleEmailService();
