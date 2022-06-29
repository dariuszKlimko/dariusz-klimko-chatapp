require('dotenv').config()
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const connection = require('../controllers/mysql')
const randomCode = require('../controllers/randomCode')
const authCode = require('../controllers/authCode')
const authForceLogoutCode = require('../controllers/authForceLogoutCode')
// const sendSMS = require('../controllers/twilio')
// const sendSMS = require('../controllers/aws')
const passportJwt = require('../controllers/passportJwt')
const {uploadFile} = require('../controllers/cloudinary')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
router.post('/login', async (req, res, next)=>{
  try{
    const date = parseInt(Date.parse(new Date().toISOString()))+120000
    const name = req.body.name
    const tel = req.body.tel.replace(/[+-\s]/g, '')
    let sql = `
      SELECT * FROM users
      WHERE 
        tel = '${tel}'
    `;
    connection.query(sql, async(err, result, fields) => {
      if (err){
        console.log(err.message)
        return res.send({loginFlag: false, otherDeviceIsActive: false, message: 'database error'});
      } 
      // -------------------------------------------------------------------------------------
      else if(result.length !== 0){
        if(result[0].verified===1&&result[0].uid!==0){
          return res.send({loginFlag: false, otherDeviceIsActive: true, message: 'first logout from other device'})
        } else{
          // const getRandomCode = await randomCode(100000, 999999); 
          const getRandomCode = authCode(tel);  
          sql = `
          UPDATE 
            users
          SET 
            sms_code = '${getRandomCode}',
            sms_code_expire_date =  '${date}'
          WHERE 
            tel = '${tel}'
          `;
          connection.query(sql, (err, result, fields) => {
            if (err){
              console.log(err.message)
              return res.send({loginFlag: false, otherDeviceIsActive: false, message: 'database error'})
            } else{
              // sendSMS(getRandomCode, tel)
              console.log('sms_code sent')
              return res.send({loginFlag: true, otherDeviceIsActive: false, message: 'sms_code sent'})
            }
          })
        }
      } 
      // -------------------------------------------------------------------------------------
      else{
        const tel = req.body.tel.replace(/[+-\s]/g, '')
        // const getRandomCode = await randomCode(100000, 999999);  
        const getRandomCode = authCode(tel);
        const avatar = ''
        const sms_code = getRandomCode
        const force_logout_code = 0
        const verified = 0
        const uid = 0
      // ---------insert in to table if value of column not exist----------------------
        let sql = `
          INSERT INTO users (name, tel, avatar, contacts, uid, verified, sms_code, sms_code_expire_date, force_logout_code, force_logout_code_expire_date ) 
          SELECT * FROM (SELECT '${name}' AS name, '${tel}' AS tel, '${avatar}' AS avatar, 'contacts_${tel}' AS contacts, '${uid}' as uid, '${verified}' AS verified, '${sms_code}' AS sms_code, '${date}' AS sms_code_expire_date, '${force_logout_code}' AS force_logout_code, '${date}' AS force_logout_code_expire_date ) AS tmp
          WHERE NOT EXISTS 
          (SELECT tel FROM users WHERE tel = '${tel}')
        `;
        connection.query(sql, (err, result, fields) => {
          if (err){
            console.log(err.message)
            return res.send({loginFlag: false, otherDeviceIsActive: false, message: 'database error'})
          } else{
            // ------ctreate contasts table of 'tel' user--------
            const contacts = 'contacts_'+tel.toString()
            sql = `CREATE TABLE IF NOT EXISTs ?? (
              id INT PRIMARY KEY AUTO_INCREMENT,
              name VARCHAR(255) NOT NULL,
              contacts VARCHAR(255) NOT NULL,
              accepted VARCHAR(255) NOT NULL,
              accepted_by_contact VARCHAR(255) NOT NULL,
              rejected VARCHAR(255) NOT NULL, 
              rejected_by_contact VARCHAR(255) NOT NULL, 
              seen VARCHAR(255) NOT NULL,
              avatar VARCHAR(255) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`;
            connection.query(sql, contacts, (err, result, fields) => {
              if (err){
                console.log(err.message)
                return res.send({loginFlag: false, otherDeviceIsActive: false, message: 'database error'})
              } else{
                // ------ctreate contasts table of 'tel' user--------
                const calls = 'calls_'+tel.toString()
                sql = `CREATE TABLE IF NOT EXISTs ?? (
                  id INT PRIMARY KEY AUTO_INCREMENT,
                  uuid VARCHAR(255) NOT NULL,
                  name VARCHAR(255) NOT NULL,
                  contact VARCHAR(255) NOT NULL,
                  avatar VARCHAR(255) NOT NULL,
                  you_are_calling VARCHAR(255) NOT NULL,
                  outcoming_ok VARCHAR(255) NOT NULL,
                  outcoming_not VARCHAR(255) NOT NULL,
                  incoming_ok VARCHAR(255) NOT NULL,
                  incoming_not VARCHAR(255) NOT NULL,
                  seen VARCHAR(255) NOT NULL,
                  created_at VARCHAR(255) NOT NULL
                )`;
                connection.query(sql, calls, (err, result, fields) => {
                  if (err){
                    console.log(err.message)
                    return res.send({loginFlag: false, otherDeviceIsActive: false, message: 'database error'})
                  } else{
                    // sendSMS(getRandomCode, tel)
                  console.log('sms_code sent')
                  console.log(`table: contacts_+${tel} created`, `table: calls_+${tel} created`)
                  return res.send({loginFlag: true, otherDeviceIsActive: false, message: 'sms_code sent'})
                  }
                })
              }
            })
          }
        })
      }
    })
  }
  catch(err){
    res.send(err)
  }
})
// ----------------------------------------------------------------------
router.put('/verify/:tel', async (req, res, next)=>{
  try{
    const tel = req.params.tel.replace(/[+-\s]/g, '')
    const code = req.body.sms_code
    let sql = `
      SELECT sms_code, avatar FROM users
      WHERE 
        tel = '${tel}'
    `;
    connection.query(sql, async(err, result, fields) => {
      if (err){
        console.log(err.message)
        return res.send({verify: false, tel: null, message: 'database error'})
      } else {
        if((parseInt(result[0].sms_code) === parseInt(code)) && (parseInt(code) != 0) && (parseInt(result[0].sms_code) != 0)){
          const getRandomCode = await randomCode(100000000000, 999999999999); 
          sql = `
            UPDATE users
            SET 
              verified = '1', 
              uid = '${getRandomCode}',
              sms_code = '0',
              sms_code_expire_date = null
            WHERE 
              tel = '${tel}'
          `;
          connection.query(sql, (err, result, fields) => {
            if (err){
              console.log(err.message)
              return res.send({verify: false, tel: null, message: 'database error'})
            } else{
              console.log('correct verification code')
              const accessToken = jwt.sign({uid: getRandomCode}, process.env.ACCESS_TOKEN_SECRET)
              res.cookie('accessToken', accessToken, { expires: new Date(Date.now() + 315360000000), httpOnly: true, sameSite: 'none',  secure: true})
              res.cookie('accessTokenExist', true, { expires: new Date(Date.now() + 315360000000)})
              return res.send({verify: true, tel: tel, message: 'correct verification code'})
            }
          });
        } else{
          console.log('incorrect verification code')
          return res.send({verify: false, tel: null, message: 'incorrect verification code'})
        }
      }
    });
  }
  catch(err){
    res.send(err)
  }
})
// ----------------------------------------------------------------------
router.put('/logout/:tel', passportJwt.passportJwt, async (req, res, next)=>{
  try{
    const tel = req.params.tel
    const sql = `
      UPDATE users
      SET 
        verified = '0', 
        uid = '0',
        sms_code = '0',
        sms_code_expire_date = null,
        force_logout_code = '0',
        force_logout_code_expire_date = null
      WHERE 
        tel = '${tel}'
    `;
    connection.query(sql, (err, result, fields) => {
      if (err){
        console.log(err.message)
        return res.send({user_logged_out: null, message: 'database error'})
      } else{
        console.log('user logged out')
        res.clearCookie('accessToken')
        res.clearCookie('accessTokenExist')
        return res.send({user_logged_out: true, message: 'user logged out'})
      }
    });
  }
  catch(err){
    res.send(err)
  }
})
// ----------------------------------------------------------------------
  router.put('/forceLogout/:tel', async (req, res, next)=>{
    try{
      const date = parseInt(Date.parse(new Date().toISOString()))+120000
      const tel = req.params.tel.replace(/[+-\s]/g, '')
      let sql = `
        SELECT * FROM users
        WHERE 
          tel = '${tel}'
      `;
      connection.query(sql, async(err, result, fields) => {
        if (err){
          console.log(err.message)
          return res.send({logoutFlag: false, message: 'database error'});
        } else{
          // const getRandomCode = await randomCode(100000, 999999); 
          const getRandomCode = authForceLogoutCode(tel);
          sql = `
          UPDATE 
            users
          SET 
            force_logout_code = '${getRandomCode}',
            force_logout_code_expire_date =  '${date}'
          WHERE 
            tel = '${tel}'
          `;
          connection.query(sql, (err, result, fields) => {
            if (err){
              console.log(err.message)
              return res.send({logoutFlag: false, message: 'database error'})
            } else{
              // sendSMS(getRandomCode, tel)
              console.log('sms_code sent')
              return res.send({logoutFlag: true, message: 'sms_code sent'})
            }
          }); 
        }
      })
    }
    catch(err){
      res.send(err)
    }
  })
// ----------------------------------------------------------------------
router.put('/verifyForceLogout/:tel', async (req, res, next)=>{
  try{
    const tel = req.params.tel.replace(/[+-\s]/g, '')
    console.log(tel,'tel')
    const code = req.body.force_logout_code
    let sql = `
      SELECT force_logout_code FROM users
      WHERE 
        tel = '${tel}'
    `;
    connection.query(sql, async(err, result, fields) => {
      if (err){
        console.log(err.message)
        return res.send({verify: false, message: 'database error'})
      } else {
        if((parseInt(result[0].force_logout_code) === parseInt(code) && (parseInt(code) != 0) && (parseInt(result[0].force_logout_code) != 0))){
          sql = `
            UPDATE users
            SET 
              verified = '0', 
              uid = '0',
              force_logout_code = '0',
              force_logout_code_expire_date = null
            WHERE 
              tel = '${tel}'
          `;
          connection.query(sql, (err, result, fields) => {
            if (err){
              console.log(err.message)
              return res.send({verify: false, message: 'database error'})
            } else{
              console.log('correct verification code')
              return res.send({verify: true, message: 'correct verification code'})
            }
          });
        } else{
          console.log('incorrect verification code')
          return res.send({verify: false, message: 'incorrect verification code'})
        }
      }
    });
  }
  catch(err){
    res.send(err)
  }
})
// ----------------------------------------------------------------------
router.post('/clearCookies', async (req, res, next)=>{
  try{
    console.log('cookies clean')
    res.clearCookie('accessToken')
    res.clearCookie('accessTokenExist')
    return res.send({message: 'cookies are cleaned'})
  }
  catch(err){
    res.send(err)
  }
})
// ----------------------------------------------------------------------
router.delete('/deleteTel/:tel', [passportJwt.passportJwt, uploadFile], async (req, res, next)=>{
    try{
      const tel = req.params.tel
      const result = req.body.avatar.substring(req.body.avatar.lastIndexOf("/chatApp/") +1);
      const nextResult = result.substring(0, result.lastIndexOf('.'))
      const avatar = [nextResult]
      const table_name = 'contacts_'+tel.toString()
      const table_calls = 'calls_'+tel.toString()
// ---------------------------------------------------------------------------------------------------
      let sql = `
        SELECT name, contacts FROM ??
      `;
       connection.query(sql, table_name, (err, result, fields) => {
        if (err){
          console.log(err.message)
          return res.send({user_deleted: null, message: 'database error'})
        } else{
          cloudinary.api.delete_resources(avatar, (error, result) => {console.log('resources_deleted'); })
          let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
          const table_contacts = resultArray.map(x=> 'contacts_'+x.contacts.toString() )
          // -------------------------------------------
          const table_conversation = resultArray.map(x=>tel>x.contacts?`a${tel}b${x.contacts}c`:`a${x.contacts}b${tel}c`)
          // -------------------------------------------
          if(resultArray.length!==0){
            table_contacts.forEach((x,i) => {
              let sql = `
                  DELETE FROM ??
                  WHERE 
                    contacts = '${tel}'
              `;
              connection.query(sql, x, (err, result, fields) => {
                if (err){
                  console.log(err.message)
                  return res.send({user_deleted: null, message: 'database error'})
                } else if(i === (table_contacts.length-1)){
                  let sql = `
                        DELETE FROM users
                        WHERE 
                          tel = '${tel}'
                    `;
                  connection.query(sql, (err, result, fields) => {
                    if (err){
                      console.log(err.message)
                      return res.send({user_deleted: null, message: 'database error'})
                    } else{
                      // -----------------------------------------------------------
                      table_conversation.push(table_name)
                      table_conversation.push(table_calls)
                      table_conversation.forEach((x,i)=>{
                        sql = `
                          DROP TABLE IF EXISTS ??
                        `;
                        connection.query(sql, x, (err, result, fields) => {
                          if (err){
                            console.log(err.message)
                            return res.send({user_deleted: null, message: 'database error'})
                          } else if(i===(table_conversation.length-1)){
                            console.log('user deleted from databse')
                            res.clearCookie('accessToken')
                            res.clearCookie('accessTokenExist')
                            return res.send({user_deleted: true, message: 'user deleted from database'})
                          }
                        })
                      // -----------------------------------------------------------
                      })
                    }
                  });
                }
              });
            })
          } 
          else{
            let sql = `
              DELETE FROM users
              WHERE 
                tel = '${tel}'
            `;
            connection.query(sql, (err, result, fields) => {
              if (err){
                console.log(err.message)
                return res.send({user_deleted: null, message: 'database error'})
              } else{
                const arr = [table_calls, table_name]
                arr.forEach((x,i)=>{
                  sql = `
                    DROP TABLE ??
                  `;
                  connection.query(sql, x, (err, result, fields) => {
                    if (err){
                      console.log(err.message)
                      return res.send({user_deleted: null, message: 'database error'})
                    } else if(i===(arr.length-1)){
                      console.log('user deleted from databse')
                      res.clearCookie('accessToken')
                      res.clearCookie('accessTokenExist')
                      return res.send({user_deleted: true, message: 'user deleted from database'})
                    }
                  })
                })
              }
            });
          }
        }
      });
    }
    catch(err){
      res.send(err)
    }
  })
// ----------------------------------------------------------------------------------------------------
router.post('/addAvatar/:tel/:name', [passportJwt.passportJwt, uploadFile], async (req, res, next)=>{
  try{
    const tel = req.params.tel
    const name = req.params.name
    const avatar = req.file.path
    const table_name = 'contacts_'+tel.toString()

    let sql = `
      UPDATE users
      SET  
        avatar = '${avatar}'
      WHERE 
        tel = '${tel}'
    `;
    connection.query(sql, (err, result, fields) => {
      if (err){
        console.log(err.message)
        return res.send({tel: tel, avatar: null, message: 'database error'})
      } else{
        sql = `
        SELECT contacts FROM ??
        `;
        connection.query(sql, table_name, (err, result, fields) => {
          if (err){
            console.log(err.message)
            return res.send({tel: tel, avatar: null, message: 'database error'})
          } else{
            let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
            if(resultArray.length > 0){
              const array = resultArray.map(x => 'contacts_'+x.contacts.toString())
              array.forEach((x, i)=>{
                sql = `
                  UPDATE ??
                  SET
                    avatar = '${avatar}'
                  WHERE
                    contacts = '${tel}'
                `;
                connection.query(sql, x, (err, result, fields) => {
                  if (err){
                    console.log(err.message)
                    return res.send({tel: tel, avatar: null, message: 'database error'})
                  } else if(i === (array.length-1)){
                    console.log('avatar inserted to database')
                    return res.send({tel: tel, avatar: avatar, name: name, message: 'avatar inserted to database'})
                  }
                })
              })
            } else{
              console.log('avatar inserted to database')
              return res.send({tel: tel, avatar: avatar, message: 'avatar inserted to database'})
            }
          }
        })
      }
    });
  }
  catch(err){
    res.send(err)
  }
})
// ----------------------------------------------------------------------
router.delete('/deleteAvatar/:tel', [passportJwt.passportJwt, uploadFile], async (req, res, next)=>{
  try{
    const tel = req.params.tel
    const result = req.body.avatar.substring(req.body.avatar.lastIndexOf("/chatApp/") +1);
    const nextResult = result.substring(0, result.lastIndexOf('.'))
    const avatar = [nextResult]
    const table_name = `contacts_${tel}`

    let sql = `
      UPDATE users
      SET  
        avatar = ''
      WHERE 
        tel = '${tel}'
    `;
    connection.query(sql, (err, result, fields) => {
      if (err){
        console.log(err.message)
        return res.send({tel: tel, avatar: null, message: 'database error'})
      } else{
        cloudinary.api.delete_resources(avatar, (error, result) => {console.log('resources_deleted'); })
        sql = `
          SELECT contacts FROM ??
        `;
        connection.query(sql, table_name, (err, result, fields) => {
          if (err){
            console.log(err.message)
            return res.send({tel: tel, avatar: null, message: 'database error'})
          } else{
            let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
            if(resultArray.length > 0){
              const array = resultArray.map(x => `contacts_${x.contacts}`)
              array.forEach((x, i) => {
                sql = `
                  UPDATE ??
                  SET
                    avatar = ''
                  WHERE
                    contacts = '${tel}'
                `;
                connection.query(sql, x, (err, result, fields) => {
                  if (err){
                    console.log(err.message)
                    return res.send({tel: tel, avatar: null, message: 'database error'})
                  } else if(i === (array.length-1)){
                    console.log('avatar deleted from database')
                    return res.send({tel: tel, avatar: null, message: 'avatar deleted from database'})
                  }
                })
              })
            } else{
              console.log('avatar deleted from database')
              return res.send({tel: tel, avatar: null, message: 'avatar deleted from database'})
            }
          }
        })
      }
    });
  }
  catch(err){
    res.send(err)
  }
})

module.exports = router;