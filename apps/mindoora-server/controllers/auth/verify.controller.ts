import { Request, Response } from 'express';
import { pool } from '../../utils/PrismaInstance';
import validator from 'validator';

function isValidEmail(email: string) {
  return validator.isEmail(email);
}


export const verifyController = async (req: Request, res: Response) => {
  try {
    const email = req.query?.email as string;
    const passcode = req.query?.passcode as string;
    const passcodeNumber = +passcode;
    const localTime = new Date();

    if (!email || !passcode) {
      return res.status(400).json({ message: 'Required data not found' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Get the most recent verification code for this email
    const verificationResult = await pool.query(
      'SELECT * FROM "EmailVerify" WHERE email = $1 ORDER BY "createAt" DESC LIMIT 1',
      [email]
    );
    const lastVerificationCode = verificationResult.rows[0];

    if (!lastVerificationCode) {
      return res.status(400).json({ message: 'Not Exists' });
    }
    if (lastVerificationCode.code !== passcodeNumber) {
      return res.status(400).json({ message: 'Pass Code Not Matched' });
    }
    if (new Date(lastVerificationCode.expireAt) < localTime) {
      return res.status(400).json({ message: 'Verification Code Expired' });
    }

    // Check if account exists and get verification status
    const accountResult = await pool.query(
      'SELECT * FROM "Register" WHERE email = $1',
      [email]
    );
    const account = accountResult.rows[0];

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    if (account.verified){
      return res.status(200).json({ message: 'Account is already verified' });
    }

    // Update account verification status
    await pool.query(
      'UPDATE "Register" SET verified = true WHERE email = $1',
      [email]
    )

    return res.status(200).json({ message: 'Account Verified' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Verification failed' });
  }
};

export default verifyController;
