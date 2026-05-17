const {
  PASSWORD_RULES,
  validateName,
  validateEmail,
  validatePassword,
  validateAge,
  validateGender,
  validatePhoto,
  validateSkills,
  validateAbout,
} = require('./fieldValidators');

/**
 * Helper — runs a field validator only if the value is present,
 * and pushes any error into the errors object.
 *
 * @param {object}  errors      - The errors accumulator
 * @param {string}  field       - Field name (used as errors key)
 * @param {*}       value       - The value to validate
 * @param {fn}      validatorFn - One of the field validators from fieldValidators.js
 * @param {boolean} required    - If true, also errors when value is missing
 */
const applyValidator = (
  errors,
  field,
  value,
  validatorFn,
  required = false,
) => {
  if (value === undefined || value === null) {
    if (required) errors[field] = `${field} is required`;
    return; // optional field not provided — skip
  }
  const result = validatorFn(value);
  if (!result.valid) {
    errors[field] = result.error;
  }
};

// ─── Data validators (pure functions, no Express dependency) ──────────────────

// Used by /login — only email + password are checked
const validateUserData = (data) => {
  const errors = {};
  applyValidator(errors, 'email', data.email, validateEmail, true);
  applyValidator(errors, 'password', data.password, validatePassword, true);
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Used by /signup — all fields validated
const validateSignupData = (data) => {
  const errors = {};
  applyValidator(errors, 'name', data.name, validateName, true);
  applyValidator(errors, 'email', data.email, validateEmail, true);
  applyValidator(errors, 'password', data.password, validatePassword, true);
  applyValidator(errors, 'age', data.age, validateAge);
  applyValidator(errors, 'gender', data.gender, validateGender);
  applyValidator(errors, 'photo', data.photo, validatePhoto);
  applyValidator(errors, 'skills', data.skills, validateSkills);
  applyValidator(errors, 'about', data.about, validateAbout);
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Used by PATCH /profile — only allowlisted fields, no email/password changes
const validateUserDataForProfileUpdate = (data) => {
  const errors = {};

  const allowedFields = ['name', 'age', 'gender', 'photo', 'skills', 'about'];
  Object.keys(data).forEach((key) => {
    if (!allowedFields.includes(key)) {
      errors[key] = 'This field cannot be updated';
    }
  });

  applyValidator(errors, 'name', data.name, validateName);
  applyValidator(errors, 'age', data.age, validateAge);
  applyValidator(errors, 'gender', data.gender, validateGender);
  applyValidator(errors, 'photo', data.photo, validatePhoto);
  applyValidator(errors, 'skills', data.skills, validateSkills);
  applyValidator(errors, 'about', data.about, validateAbout);

  return { isValid: Object.keys(errors).length === 0, errors };
};

// ─── Express middlewares ───────────────────────────────────────────────────────

// Factory — wraps any data validator function into an Express middleware.
// This removes the repeated if (!validation.isValid) res.status(400)... pattern.
const makeValidatorMiddleware = (validatorFn) => (req, res, next) => {
  const validation = validatorFn(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }
  next();
};

const validateUser = makeValidatorMiddleware(validateUserData);
const validateSignup = makeValidatorMiddleware(validateSignupData);
const validateProfileUpdate = makeValidatorMiddleware(
  validateUserDataForProfileUpdate,
);

module.exports = {
  // Re-export so other files only need to import from validation.js
  validateEmail,
  validatePassword,
  PASSWORD_RULES,
  // Data validators (useful for unit testing without Express)
  validateUserData,
  validateSignupData,
  validateUserDataForProfileUpdate,
  // Express middlewares
  validateUser,
  validateSignup,
  validateProfileUpdate,
};
