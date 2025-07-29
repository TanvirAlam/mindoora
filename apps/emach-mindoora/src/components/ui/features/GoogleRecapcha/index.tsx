import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  captchaRef: any;
};

const GoogleRecapcha = ({ captchaRef }: Props) => {
  const captchaEnv = process.env.NEXT_PUBLIC_GOOGLE_RECAPCHA_SITE_KEY as string;

  return <ReCAPTCHA theme="dark" sitekey={captchaEnv} ref={captchaRef} />;
};

export default GoogleRecapcha;
