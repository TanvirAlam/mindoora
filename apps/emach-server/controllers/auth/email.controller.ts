import * as nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: process.env.NEXT_PUBLIC_EMAIL_HOST,
  auth: {
    user: process.env.NEXT_PUBLIC_EMAIL,
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD
  }
})

const sendVerificationEmail = async (
  toEmail: string,
  verificationToken: string,
  subject: string = 'Emach Account Verification Code'
) => {
  try {
    const mailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL,
      to: toEmail,
      subject: subject,
      text: `
        Dear Contributor,
        Please use the following verification code within the next 5 minutes to verify your donor account:

        Verification Code: ${verificationToken}

        You can also click the link below to verify your account:
        auth/verify?email=${toEmail}&passcode=${verificationToken}

        If you didn't request this verification, please disregard this email.

        Best regards,
        eMACH Team
      `
    }

    await transporter.sendMail(mailOptions)

    console.log(`Verification email sent to ${toEmail}`)
  } catch (error: any) {
    console.error(`Error sending verification email: ${error.message}`)
    throw new Error('Error sending verification email')
  }
}

export default sendVerificationEmail
