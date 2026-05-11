const validator = require('validator');

// Password validation rules
const PASSWORD_RULES = {
  minLength: 8,
  minLowercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  minUppercase: 1,
};

// Validate email
const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

// Validate password
const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (!validator.isStrongPassword(password, PASSWORD_RULES)) {
    return {
      valid: false,
      error:
        'Password must be at least 8 characters with uppercase, lowercase, number and symbol',
    };
  }
  return { valid: true };
};

// Validate user data
const validateUserData = (data) => {
  const errors = {};

  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    }
  }

  if (data.password) {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Middleware for user validation
const validateUser = (req, res, next) => {
  const validation = validateUserData(req.body);

  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }

  next();
};



module.exports = {
  validateEmail,
  validatePassword,
  validateUserData,
  validateUser,
  PASSWORD_RULES,
};
