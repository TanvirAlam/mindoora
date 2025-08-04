export const verifyEmailData = (recieverEmail: string, verificationToken: string) => {
  const mailData = {
    from: process.env.NEXT_PUBLIC_EMAIL || 'mindooragroup@gmail.com',
    to: recieverEmail,
    subject: 'Email Verification',
    text: `Click the link to verify your email:${process.env.VERIFY_EMAIL_URL}/${verificationToken}`,
    html: `<p>Click the <a href=${process.env.VERIFY_EMAIL_URL}/${verificationToken}>email verification link</a> to verify your email.</p>`
  }
  return mailData
}
