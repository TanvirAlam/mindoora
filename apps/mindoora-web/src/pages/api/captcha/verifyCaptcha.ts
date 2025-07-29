import { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const captchaEnv = process.env
      .NEXT_PUBLIC_GOOGLE_RECAPCHA_SECRET_KEY as string;
    try {
      fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${captchaEnv}&response=${req.body.gRecaptchaToken}`,
      })
        .then((reCaptchaRes) => reCaptchaRes.json())
        .then((reCaptchaRes) => {
          if (reCaptchaRes?.success) {
            res.status(200).json({
              status: "success",
              message: "Google ReCaptcha Verification successfully done",
            });
          } else {
            res.status(400).json({
              status: "failure",
              message: "Google ReCaptcha Verification Failure",
            });
          }
        });
    } catch (err) {
      console.error(err);
      res.status(405).json({
        status: "failure",
        message: "Error submitting the enquiry form",
      });
    }
  } else {
    res.status(405);
    res.end();
  }
};

export default handler;
