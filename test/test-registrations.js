'use strict';
var Lambda = require('../index')
var Boom = require('boom')
var AWS = require('aws-sdk');

var Chai = require('chai');
var assert = Chai.assert;
var expect = Chai.expect;
var Reg = require('../index');

AWS.config.region = 'us-east-1';


before((done) => {
  // cleanup the default user, so it can be created
  var email = "register@you2.com"
  var defaultUser = {
    "params": {
      "path": {
        "email": email
      }
    },
    "context": {
      "http-method": "DELETE",
      "resource-path": "/registrations/{email}"
    }
  }
  context.fail = (error) => {
    // ignore errors
    expect(error).to.exist;
    done();
  };
  context.succeed = (response) => {
    expect(response.to.exist)
    done();
  }

  Reg.handler(defaultUser, context);
})

var context = {
  fail: function (error) {},
  succeed: function (response) {},
  done: function (error, response) {
    if (error) {
      this.fail(error);
    } else {
      this.succeed(response)
    }
  }
};

describe('Registrations:@integration', () => {
  it('should fail when invoking with an invalid request context', (done) => {
    var badContext = {
      "params": {
        "querystring": {
          "password": "garbage9",
          "email": "you@you3.com"
        }
      },
      "context": {
        "http-method": "GET",
      }
    }

    context.fail = (error) => {
      expect(error).to.exist;
      var obj = JSON.parse(error);
      expect(obj.name).to.equal('ValidationError');
      done();
    };
    context.succeed = (response) => {
      expect(response).to.not.exist;
      done();
    }

    Reg.handler(badContext, context);
  });

  it('should fail when invoking with insufficient parameters', (done) => {
    var withoutLastName = {
      "body": {
        "email": "me@my.com",
        properties: {
          "firstName": "John"
        }
      },
      "context": {
        "http-method": "POST",
        "resource-path": "/registrations"
      }
    }
    context.fail = (error) => {
      expect(error).to.exist;
      var obj = JSON.parse(error);
      expect(obj.statusCode).to.equal(400);
      done();
    };
    context.succeed = (response) => {
      expect(response).to.not.exist;
      done();
    }
    Reg.handler(withoutLastName, context);
  });

  it('should succeed when invoking with good parameters', (done) => {
    var goodRequest = {
      "body": {
        "email": "register@you2.com",
        "password": "garbage8",
        properties: {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "context": {
        "http-method": "POST",
        "resource-path": "/registrations"
      }
    }
    context.fail = (error) => {
      expect(error).to.not.exist;
      var obj = JSON.parse(error);
      done();
    };
    context.succeed = (response) => {
      expect(response).to.exist;
      done();
    }
    Reg.handler(goodRequest, context);
  });

  it('should fail when invoking with duplicate email', (done) => {
    var duplicateRequest = {
      "body": {
        "email": "register@you2.com",
        "password": "garbage8",
        properties: {
          "firstName": "John",
          "lastName": "Doe"
        }
      },
      "context": {
        "http-method": "POST",
        "resource-path": "/registrations"
      }
    }
    context.fail = (error) => {
      expect(error).to.exist;
      var obj = JSON.parse(error);
      done();
    };
    context.succeed = (response) => {
      expect(response).to.not.exist;
      done();
    }
    Reg.handler(duplicateRequest, context);
  });
});

after((done) => {
  // remove the default user, so it can be created
  var email = "register@you2.com"
  var defaultUser = {
    "params": {
      "path": {
        "email": email
      }
    },
    "context": {
      "http-method": "DELETE",
      "resource-path": "/registrations/{email}"
    }
  }
  context.fail = (error) => {
    // ignore errors
    expect(error).to.exist;
    done();
  };
  context.succeed = (response) => {
    expect(response).to.exist;
    done();
  }

  Reg.handler(defaultUser, context);
});
