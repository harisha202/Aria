export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePassword = (password) => password.length >= 6

export const validateStrongPassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber
}

export const validateName = (name) => name.trim().length >= 2

export const validateOTP = (otp) => /^\d{6}$/.test(otp)
