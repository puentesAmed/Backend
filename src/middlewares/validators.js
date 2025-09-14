const {body, param} = require('express-validator');

const registerValidator = [
    body('email').isEmail(),
    body('password').isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
];
const loginValidator = [
        body('email').isEmail(),
        body('password').isString().isLength({ min: 8 }),
];
const idParamValidator = [
    param('id').isMongoId(),
];

module.exports = {
    registerValidator,
    loginValidator,
    idParamValidator,
};