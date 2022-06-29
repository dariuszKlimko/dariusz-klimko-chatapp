require('dotenv').config()
var AWS = require("aws-sdk");
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack,'aws error');
});

var params = {
  attributes: [
    'DefaultSMSType'
  ]
};

var getSMSTypePromise = new AWS.SNS({apiVersion: '2010-03-31'}).getSMSAttributes(params).promise();

getSMSTypePromise.then(
  function(data) {
    console.log(data,'getSMSTypePromise aws');
  }
).catch(
  function(err) {
    console.error(err, err.stack,'getSMSTypePromise aws error');
  }
);

var params = {
  attributes: {
    'DefaultSMSType': 'Promotional' /* lowest cost */
  }
};
    
var setSMSTypePromise = new AWS.SNS({apiVersion: '2010-03-31'}).setSMSAttributes(params).promise();
    
setSMSTypePromise.then(
  function(data) {
    console.log(data,'setSMSTypePromise aws');
  }
).catch(
    function(err) {
    console.error(err, err.stack,'setSMSTypePromise aws error');
  }
);

const sendSMS = (body, to) =>{
  var params = {
    Message: `${body}`,
    PhoneNumber: `+${to}`
  };
  var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();      
  publishTextPromise.then(
    function(data) {
      console.log("MessageID is " + data.MessageId);
    }
  ).catch(
      function(err) {
      console.error(err, err.stack);
    }
  );
}

module.exports = sendSMS