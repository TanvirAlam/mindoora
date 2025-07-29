export function generateRandomCode() {
    const min = 100000
    const max = 999999
    const randomCode = Math.floor(Math.random() * (max - min + 1)) + min

    const sixDigitCode = randomCode.toString().padStart(6, '0')

    return sixDigitCode
  }
