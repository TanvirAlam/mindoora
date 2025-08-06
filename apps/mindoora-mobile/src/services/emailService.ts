import emailjs from '@emailjs/react-native';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: 'service_fa1c15q',
  templateId: 'template_invitation',
  publicKey: 'ZG6OoF7DuVfn9LE92',
  privateKey: 'uDmjgoHhHYdnhnZJFa5wy',
};

// Debug environment variables
console.log('🔧 EmailJS Config Debug:', {
  serviceId: EMAILJS_CONFIG.serviceId,
  templateId: EMAILJS_CONFIG.templateId,
  publicKey: EMAILJS_CONFIG.publicKey ? 'Set' : 'Missing',
  envServiceId: process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID,
  envTemplateId: process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID,
  envPublicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY ? 'Set' : 'Missing',
});

export interface EmailInvitationData {
  recipientEmail: string;
  senderName: string;
  gameTitle: string;
  gameCode: string;
}

class EmailService {
  // Initialize EmailJS
  init() {
    try {
      console.log('🔧 Initializing EmailJS with public key:', EMAILJS_CONFIG.publicKey);
      emailjs.init({
        publicKey: EMAILJS_CONFIG.publicKey,
        privateKey: EMAILJS_CONFIG.privateKey,
      });
      console.log('📧 EmailJS initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
      // Try alternative initialization
      try {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('📧 EmailJS initialized with fallback method');
      } catch (fallbackError) {
        console.error('❌ Fallback initialization also failed:', fallbackError);
      }
    }
  }

  // Send invitation email using EmailJS
  async sendInvitation(data: EmailInvitationData): Promise<{ success: boolean; message: string }> {
    try {
      // Initialize if not already done
      this.init();

      const templateParams = {
        to_email: data.recipientEmail,
        to_name: 'Game Player',
        from_name: data.senderName,
        game_title: data.gameTitle,
        game_code: data.gameCode,
        message: `${data.senderName} has invited you to join their quiz game "${data.gameTitle}" on Mindoora! Use game code: ${data.gameCode}`,
      };

      console.log('📧 Sending email with params:', templateParams);

      console.log('🔧 Using EmailJS config:', {
        serviceId: EMAILJS_CONFIG.serviceId,
        templateId: EMAILJS_CONFIG.templateId
      });
      
      const result = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        {
          publicKey: EMAILJS_CONFIG.publicKey,
          privateKey: EMAILJS_CONFIG.privateKey,
        }
      );

      console.log('✅ Email sent successfully:', result);
      
      return {
        success: true,
        message: 'Invitation sent successfully!'
      };

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      return {
        success: false,
        message: 'Failed to send invitation. Please try again.'
      };
    }
  }

  // Validate email configuration
  validateConfig(): boolean {
    const { serviceId, templateId, publicKey } = EMAILJS_CONFIG;
    return !!(serviceId && templateId && publicKey && 
              publicKey !== 'YOUR_PUBLIC_KEY_HERE');
  }
}

export default new EmailService();
