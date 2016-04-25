'use strict';
console.log('Loading handler and router');

const Lambda = require('lambda-time');
const Router = new Lambda();

module.exports = {};

Router.register(require('./lib/login').route);
Router.register(require('./lib/registrations').route);
Router.register(require('./lib/registrations-remove').route);

module.exports.handler = function (event, context) {
  Router.route(event, context)
    .then((response) => {
      context.done(null, response);
    })
    .catch((error) => {
      context.done(JSON.stringify(error), null);
    })
}
