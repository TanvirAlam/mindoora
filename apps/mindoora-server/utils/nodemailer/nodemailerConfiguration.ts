import nodemailer from 'nodemailer'

// Create transporter function that handles both Gmail and fallback
export const createTransporter = async () => {
  const hasValidGmailConfig = process.env.NEXT_PUBLIC_EMAIL_PASSWORD && 
    process.env.NEXT_PUBLIC_EMAIL_PASSWORD !== 'PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE' &&
    process.env.NEXT_PUBLIC_EMAIL_PASSWORD.length > 8

  if (hasValidGmailConfig) {
    console.log('📧 Using Gmail SMTP configuration')
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL || 'mindooragroup@gmail.com',
        pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD
      }
    })
  } else {
    console.log('📧 Using Ethereal Email for testing (emails won\'t be delivered)')
    const testAccount = await nodemailer.createTestAccount()
    console.log('📧 Ethereal credentials:', testAccount.user, testAccount.pass)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }
}

// Default transporter for immediate use
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL || 'mindooragroup@gmail.com',
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD || ''
  }
})
