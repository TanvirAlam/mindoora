import { Request, Response } from 'express'

export const rootController = (req: Request, res: Response) => {
  try {
    return res.status(200).json('WELCOME TO eMACH SERVER')
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
