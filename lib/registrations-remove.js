'use strict';
console.log('Loading registrations remove handler');

const Joi = require('joi');
const UUID = require('uuid');
const AWS = require('aws-sdk');
const Dynamo = new AWS.DynamoDB.DocumentClient();
const Promise = require('bluebird');
const Boom = require('boom');
const Scrypt = require('scrypt-for-humans');
const userSchema = require('./users-schema');

module.exports = {};

const routeSchema = new Joi.object().keys({
  email: Joi.string().email()
}).unknown();

/**
 * Handler that creates a user. Verifies the incoming payload, then calls createUser
 * to save the user in the database.
 * @param  {object} event   The inbound event
 * @param  {object} context Lambda context
 */
function usersDeleteHandler(event, context) {
  return new Promise((resolve, reject) => {

    // verify that the input resource satisfies validation rules
    var input = {};

    if (event.params && event.params.path && event.params.path.email) {
      input.email = event.params.path.email
      const result = Joi.validate(input, routeSchema)
      if (result.error) {
        return reject(result.error);
      }
    } else {
      return reject(Boom.badRequest('email is required in params.path'))
    }

    // remove the user.
    // TODO: 1. need to ensure no relationships exist
    //       2. need to validate auth token in header
    removeUser(input)
      .then((response) => {
        console.log('remove: returning successfully: ' + JSON.stringify(response));
        return resolve(response)
      })
      .catch((error) => {
        console.log('remove: failed: ' + JSON.stringify(error));
        return reject(error);
      })
  });
}

/**
 * Removes a user
 * @param  {object} input Input from the request payload
 * @return {object}        A promise that resolves to the result of the delete statement
 * or rejects with an error string if the create fails.  Promise will reject
 * if a user with the specified email address already exists.
 */
function removeUser(input) {
  return new Promise((resolve, reject) => {

    console.log('remove: removing user:' + JSON.stringify(input));

    var params = {
      TableName: 'users',
      Key: {
        email: input.email
      }
    }
    try {
      Dynamo.delete(params, (error, result) => {
        if (error) {
          console.log('remove: Error received removing user: ' + JSON.stringify(error))
          return reject(Boom.badGateway('Database error encountered while removing user'));
        } else {
          console.log('remove: successfully deleted registration: ' + input.email)
          return resolve({
            email: input.email
          });
        }
      });
    } catch (error) {
      console.log('remove: Exception received while removing user: ' + JSON.stringify(error));
      return reject(Boom.badGateway('Database exception encountered while saving user'));
    }
  });

}

module.exports.route = {
  path: '/registrations/{email}',
  method: 'delete',
  handler: usersDeleteHandler
}
