require('dotenv').config()
const express = require('express')
const axios = require('axios')
const router = express.Router()
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
router.post('/recaptchaVerify', async (req, res, next)=>{
  try{
    const recaptchaToken = req.body.recaptchaToken
    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    const recaptchaResult = await axios.post(recaptchaUrl)
    return res.send({recaptchaResult: recaptchaResult.data})
  }
  catch(err){
    res.send(err)
  }
})
// ---------------------------------------------------------------------------------
module.exports = router;