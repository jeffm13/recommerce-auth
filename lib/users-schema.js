'use strict';
const Joi = require('joi');

console.log('loading user schema');

const userSchema = module.exports = new Joi.object().keys({
  email: Joi.string()
    .email()
    .required(),
  username: Joi.string(),
  id: Joi.string()
    .guid(),
  created: Joi.number(),
  modified: Joi.number(),
  password: Joi.string(),
  properties: {
    firstName: Joi.string()
      .required(),
    lastName: Joi.string()
      .required(),
    deskPhone: Joi.string(),
    cellPhone: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string(),
    country: Joi.string(),
    hash: Joi.string()
  }
});
