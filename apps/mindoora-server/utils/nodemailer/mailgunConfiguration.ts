import Mailgun from 'mailgun.js';
import formData from 'form-data';

// Initialize Mailgun
export const createMailgunClient = () => {
  const mg = new Mailgun(formData);
  
  const domain = process.env.MAILGUN_DOMAIN;
  const apiKey = process.env.MAILGUN_API_KEY;
  
  if (!domain || !apiKey) {
    throw new Error('Mailgun configuration missing. Please set MAILGUN_DOMAIN and MAILGUN_API_KEY environment variables.');
  }
  
  return mg.client({
    username: 'api',
    key: apiKey,
    url: 'https://api.mailgun.net' // Use EU endpoint: 'https://api.eu.mailgun.net' if needed
  });
};

// Send email using Mailgun
export const sendMailgunEmail = async (
  recipientEmail: string,
  subject: string,
  htmlContent: string,
  textContent?: string
) => {
  try {
    const mgClient = createMailgunClient();
    const domain = process.env.MAILGUN_DOMAIN!;
    
    const mailData = {
      from: `Mindoora Game <noreply@${domain}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };
    
    const result = await mgClient.messages.create(domain, mailData);
    console.log('✅ Email sent successfully via Mailgun:', result.id);
    
    return {
      success: true,
      messageId: result.id,
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('❌ Failed to send email via Mailgun:', error);
    throw error;
  }
};

// Validate Mailgun configuration
export const validateMailgunConfig = () => {
  const domain = process.env.MAILGUN_DOMAIN;
  const apiKey = process.env.MAILGUN_API_KEY;
  
  return {
    isValid: !!(domain && apiKey),
    domain,
    hasApiKey: !!apiKey
  };
};
