require('dotenv').config()
const client = require('twilio')(process.env.TWILIO_ACCOUNT_S_ID, process.env.TWILIO_AUTH_TOKEN);
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
const sendSMS = (body, to) =>{
      client.messages .create({ 
            body: body,  
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_S_ID,      
            to: to 
      }) 
      .then(message => console.log(message.sid)) 
      .done();
}

module.exports = sendSMS