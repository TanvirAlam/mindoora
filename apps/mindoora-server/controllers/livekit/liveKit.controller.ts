import { AccessToken } from "livekit-server-sdk";
import { Request, Response } from 'express'
import { missingParams } from "../tools";

export const liveKitController = async (req: Request, res: Response) => {
  const room = req.query.room as string;
  const username = req.query.username as string;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  missingParams({room}, res);
  missingParams({username}, res);

  try{
    const accessToken = new AccessToken(apiKey, apiSecret, { identity: username });
    accessToken.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
    return res.status(201).json({ token: accessToken.toJwt() });
  } catch (error) {
    return res.status(500).json(error)
  }
}
