'use strict';
var Lambda = require('../index')
var Boom = require('boom')
var AWS = require('aws-sdk');

var Chai = require('chai');
var assert = Chai.assert;
var expect = Chai.expect;
var Auth = require('../index');

AWS.config.region = 'us-east-1';

before((done) => {
  //create the default user
  var defaultUser = {
    "body": {
      "email": "login@you2.com",
      "password": "garbage8",
      "properties": {
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
    done();
  };
  context.succeed = (response) => {
    expect(response).to.exist;
    done();
  }
  Auth.handler(defaultUser, context);
})

var context = {
  fail: function (error) {
    return (error);
  },
  succeed: function (response) {
    return (response);
  },
  done: function (error, response) {
    if (error) {
      this.fail(error);
    } else {
      this.succeed(response)
    }
  }
};

describe('Login:@integration', () => {
  it('should fail when invoking with an invalid request context', (done) => {
    var badContext = {
      "params": {
        "querystring": {
          "password": "garbage9",
          "email": "you@you3.com"
        }
      },
      "context": {
        "http-method": "GET"
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

    Auth.handler(badContext, context);
  });

  it('should fail when invoking with no parameters', (done) => {
    var noParams = {
      "params": {},
      "context": {
        "http-method": "GET",
        "resource-path": "/login"
      }
    }

    context.fail = (error) => {
      expect(error).to.exist;
      var obj = JSON.parse(error);
      expect(obj.statusCode).to.equal(400);
      expect(obj.details[0].message).to.contain('querystring');
      done();
    };
    context.succeed = (response) => {
      expect(response).to.not.exist;
      done();
    }

    Auth.handler(noParams, context);
  });

  it('should fail when invoking with a malformed email address', (done) => {
    var malformedEmail = {
      "params": {
        "querystring": {
          "password": "garbage8",
          "email": "reallyyou@"
        }
      },
      "context": {
        "http-method": "GET",
        "resource-path": "/login"
      }
    }
    context.fail = (error) => {
      expect(error).to.exist;
      var obj = JSON.parse(error);
      var obj = JSON.parse(error);
      expect(obj.statusCode).to.equal(400);
      expect(obj.details[0].path).to.equal('params.querystring.email');
      done();
    };
    context.succeed = (response) => {
      expect(response).to.not.exist;
      done();
    }
    Auth.handler(malformedEmail, context);
  });

  it('should fail when invoking with an invalid email address', (done) => {
    var badEmail = {
      "params": {
        "querystring": {
          "password": "garbage8",
          "email": "reallyyou@you4you.com"
        }
      },
      "context": {
        "http-method": "GET",
        "resource-path": "/login"
      }
    }
    context.fail = (error) => {
      expect(error).to.exist;
      var obj = JSON.parse(error);
      expect(obj.statusCode).to.equal(401);
      done();
    };
    context.succeed = (response) => {
      expect(response).to.not.exist;
      done();
    }
    Auth.handler(badEmail, context);
  });

  it('should fail when invoking with an invalid password', (done) => {
    var badPassword = {
      "params": {
        "querystring": {
          "password": "garbage9",
          "email": "login@you2.com"
        }
      },
      "context": {
        "http-method": "GET",
        "resource-path": "/login"
      }
    }
    context.fail = (error) => {
      expect(error).to.exist;
      var obj = JSON.parse(error);
      expect(obj.statusCode).to.equal(401);
      done();
    };
    context.succeed = (response) => {
      expect(response).to.not.exist;
      done();
    }
    Auth.handler(badPassword, context);
  });

  it('should respond with a token when invoking with a valid username and password', (done) => {
    var goodLogin = {
      "params": {
        "querystring": {
          "password": "garbage8",
          "email": "login@you2.com"
        }
      },
      "context": {
        "http-method": "GET",
        "resource-path": "/login"
      }
    };
    context.fail = (error) => {
      expect(error).to.not.exist;
      done();
    };
    context.succeed = (response) => {
      expect(response).to.exist;
      expect(response.token).to.exist;
      done();
    }
    Auth.handler(goodLogin, context);
  });
});

after((done) => {
  // remove the default user, so it can be created on the next test run
  var email = "login@you2.com"
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
    expect(error).to.not.exist;
    done();
  };

  context.succeed = (response) => {
    expect(response).to.exist;
    done();
  }

  Auth.handler(defaultUser, context);
});
