import { Request, Response } from 'express';
import { miscQueries } from '../utils/query';
import { findDuplicate } from './tools';
import { saveTCSchema, saveTCType } from '../db/schemas/TC.schema ';

export const saveAcceptTCController = async (req: Request<{}, {}, saveTCType>, res: Response) => {
  try {
    const user = res.locals.user.id
    const ipAddress = req.socket.remoteAddress
    const { metadata } = req.body
    saveTCSchema.parse(req.body)

    if(await findDuplicate('acceptTC', { user }, res))return;
    await miscQueries.createAcceptTC(ipAddress, user, metadata)

    return res.status(201).json({ message: 'Accept TC Added successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json(error)
  }
}

export const getAcceptTCController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id
    const checkAcceptTC = await miscQueries.getAcceptTC(user)

    if (!checkAcceptTC){
      return res.status(404).json({ message: 'Terms and Conditions Not Accepted'})
    }

    return res.status(201).json({ message: 'Terms and Conditions Accepted'})
  } catch (error) {
    return res.status(500).json(error)
  }
}
