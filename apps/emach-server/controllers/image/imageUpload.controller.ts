import { Request, Response } from 'express'
import { miscQueries } from '../../utils/query'

export const imageUploadController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user.id

    const link =
      process.env.NODE_ENV === 'development'
        ? process.env.IMAGE_PROVIDER_DEVELOPMENT
        : process.env.IMAGE_PROVIDER_PRODUCTION

    if (!req.file) {
      return res.status(400).json({ message: 'No File Provided' })
    }

    if (!req.file.mimetype.startsWith('image')) {
      return res.status(400).json({ message: 'Not an image file' })
    }

    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ message: 'Image size exceeds 2MB' })
    }

    const imgName = req.file.filename

    const imageDetails = await miscQueries.saveImageUpload(imgName, user)

    return res.status(201).json({
      message: 'File uploaded successfully',
      imageUrl: link + imageDetails.imgName
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
