require('dotenv').config()
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const passportJwt = require('../controllers/passportJwt')
const connection = require('../controllers/mysql')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
router.get('/contacts', passportJwt.passportJwt, async (req, res, next)=>{
    try{
        const uid = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET).uid;
        let sql = `
            SELECT name, tel, avatar FROM users
            WHERE
                uid = '${uid}'
        `;
        connection.query(sql, (err, result, fields) => {
            if (err){
                console.log(err.message)
                return res.send({tel: false, avatar: null, contacts: false, message: 'database error'})
            } else{
                let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                const name = resultArray[0].name
                const tel = resultArray[0].tel
                const avatar = resultArray[0].avatar
                const table_name = 'contacts_'+tel.toString()
                sql = `
                    SELECT * FROM ??
                `;
                connection.query(sql, table_name, (err, result, fields) => {
                    if (err){
                        console.log(err.message)
                        return res.send({tel: false, avatar: null, contacts: false, message: 'database error'})
                    } else{
                        let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                        resultArray.forEach((x, i, arr)=>{
                            arr[i].socketId=undefined
                        })
                        if(result.length!==0){
                            return res.send({name: name, tel: tel, avatar: avatar, contacts: resultArray,  message: 'all your contacts'})
                        } else{
                            console.log('no contacts in your database')
                            return res.send({name: name, tel: tel, avatar: avatar, contacts: false, message: 'no contacts in database'})
                        }
                    }
                });
            }
        });   
    }
    catch(err){
        res.send(err)
    }
})
// -----------------------------------------------------------------------------------------------
router.get('/search/:contact', passportJwt.passportJwt, async (req, res, next)=>{
    try{
        const contact = req.params.contact.replace(/[+-\s]/g, '')
        let sql = `
            SELECT * FROM users
            WHERE
                tel = '${contact}'
        `;
        connection.query(sql, (err, result, fields) => {
            if (err){
                console.log(err.message)
                return res.send({contact: null, message: 'database error'})
            } else{
                let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                if(result.length!==0){
                    return res.send({contact: {name: resultArray[0].name, contact: resultArray[0].tel}, message: 'contact found in database'})
                } else{
                    console.log('no contacts in your database')
                    return res.send({contact: null, message: 'no contact in database'})
                }
            }
        });   
    }
    catch(err){
        res.send(err)
    }
})

module.exports = router;