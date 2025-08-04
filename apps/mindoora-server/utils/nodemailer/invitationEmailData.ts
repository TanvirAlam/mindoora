export const invitationEmailData = (
  recipientEmail: string, 
  gameTitle: string, 
  gameCode: string, 
  senderName: string
) => {
  const mailData = {
    from: process.env.NEXT_PUBLIC_EMAIL || 'mindooragroup@gmail.com',
    to: recipientEmail,
    subject: `🎮 You're invited to play "${gameTitle}" on Mindoora!`,
    text: `
Hi there!

${senderName} has invited you to join their quiz game "${gameTitle}" on Mindoora!

🎮 Game: ${gameTitle}
🔑 Game Code: ${gameCode}

To join the game:
1. Open the Mindoora app
2. Enter the game code: ${gameCode}
3. Start playing and have fun!

Don't have the Mindoora app yet? Download it and create your account to join the quiz!

Happy gaming!
The Mindoora Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; font-size: 28px; margin: 0;">🎮 Mindoora</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Quiz Game Invitation</p>
          </div>
          
          <!-- Main Content -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 24px; margin-bottom: 15px;">You're Invited!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              <strong>${senderName}</strong> has invited you to join their quiz game on Mindoora!
            </p>
          </div>
          
          <!-- Game Info Card -->
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #4CAF50;">
            <h3 style="color: #333; font-size: 20px; margin: 0 0 15px 0;">🎯 Game Details</h3>
            <p style="color: #666; font-size: 16px; margin: 8px 0;"><strong>Game:</strong> ${gameTitle}</p>
            <div style="background-color: #4CAF50; color: white; padding: 15px; border-radius: 6px; text-align: center; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Game Code</p>
              <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; letter-spacing: 3px;">${gameCode}</p>
            </div>
          </div>
          
          <!-- Instructions -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">📝 How to Join:</h3>
            <ol style="color: #666; font-size: 15px; line-height: 1.6; padding-left: 20px;">
              <li>Open the Mindoora app on your device</li>
              <li>Enter the game code: <strong style="color: #4CAF50;">${gameCode}</strong></li>
              <li>Join the game and start playing!</li>
            </ol>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
              Don't have the Mindoora app yet?
            </p>
            <a href="#" style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">
              Download Mindoora
            </a>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Happy gaming! 🎮<br>
              The Mindoora Team
            </p>
          </div>
          
        </div>
      </div>
    `
  }
  return mailData
}
