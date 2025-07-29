import express from 'express'

export const loggingMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.on('finish', () => {
    const statusCode = res.statusCode
    const method = req.method
    const ip = req.ip
    const originalUrl = req.originalUrl

    if (statusCode < 200 || statusCode > 299) {
      console.log('\x1b[31mERROR:\x1b[0m', method, ip, originalUrl, statusCode)
    } else {
      console.log('\x1b[32mINFO:\x1b[0m', method, ip, originalUrl, statusCode)
    }
  })

  next()
}
