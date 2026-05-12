const validator = require('validator');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const PASSWORD_RULES = {
  minLength: 8,
  minLowercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  minUppercase: 1,
};

/**
 * Each validator follows the same contract:
 *   { valid: true }  on success
 *   { valid: false, error: string }  on failure
 */

const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  if (name.trim().length < 2 || name.trim().length > 50) {
    return { valid: false, error: 'Name must be between 2 and 50 characters' };
  }
  return { valid: true };
};

const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

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

const validateAge = (age) => {
  const parsed = Number(age);
  if (isNaN(parsed) || parsed < 18 || parsed > 120) {
    return { valid: false, error: 'Age must be a number between 18 and 120' };
  }
  return { valid: true };
};

const validateGender = (gender) => {
  if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
    return { valid: false, error: 'Gender must be male, female, or other' };
  }
  return { valid: true };
};

const validatePhoto = (photo) => {
  if (!validator.isURL(photo, { protocols: ['http', 'https'] })) {
    return { valid: false, error: 'Please provide a valid URL for photo' };
  }
  return { valid: true };
};

const validateSkills = (skills) => {
  if (!Array.isArray(skills)) {
    return { valid: false, error: 'Skills must be an array' };
  }
  if (skills.length > 10) {
    return { valid: false, error: 'A user can have at most 10 skills' };
  }
  return { valid: true };
};

// Single place for bcrypt hashing — SALT_ROUNDS is defined once here.
// Import and use this instead of calling bcrypt.hash(password, 10) directly
// in routes, so if you ever change the salt rounds you change it in one place.
// Always await — bcrypt.hash is async.
const hashPassword = (plaintext) => bcrypt.hash(plaintext, SALT_ROUNDS);

module.exports = {
  PASSWORD_RULES,
  validateName,
  validateEmail,
  validatePassword,
  validateAge,
  validateGender,
  validatePhoto,
  validateSkills,
  hashPassword,
};
