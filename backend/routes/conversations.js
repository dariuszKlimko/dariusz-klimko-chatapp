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
// ---------------------------------------------------------------------
router.get('/conversations', passportJwt.passportJwt, async (req, res, next)=>{
    try{
        const uid = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET).uid;
        let sql = `
            SELECT tel FROM users
            WHERE
                uid = '${uid}'
        `;
        connection.query(sql, (err, result, fields) => {
            if (err){
                console.log(err.message)
                return res.send({tel: false, conversations: false, message: 'database error'})
            } else{
                let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                const tel = resultArray[0].tel
                const table_name = 'contacts_'+tel.toString()
                sql = `
                    SELECT contacts FROM ??
                `;
                connection.query(sql, table_name, (err, result, fields) => {
                    if (err){
                        console.log(err.message)
                        return res.send({tel: false, conversations: false, message: 'database error'})
                    } else{
                        let resultArray_1 = Object.values(JSON.parse(JSON.stringify(result)))
                        const finalArray = resultArray_1.map(x=>{
                            return {conversationWith:parseInt(x.contacts), conversation:[]}
                        })
                        const conversationsArray = resultArray_1.map(x=>tel>parseInt(x.contacts)?`a${tel}b${x.contacts}c`:`a${x.contacts}b${tel}c`)
                        if(conversationsArray.length!==0){
                            conversationsArray.forEach((x,i)=>{
                                sql=`
                                    SELECT * FROM ??
                                `;
                                connection.query(sql, x, (err, result, fields) => {
                                    if (err){
                                        console.log(err.message)
                                        return res.send({tel: false, conversations: false, message: 'database error'})
                                    } else{
                                        let resultArray_2 = Object.values(JSON.parse(JSON.stringify(result)))
                                        const firstTel = x.split('a')[1].split('b')[0]
                                        const secondTel = x.split('b')[1].split('c')[0]
                                        const finalTel = parseInt(firstTel)===parseInt(tel)&&parseInt(secondTel)||parseInt(secondTel)===parseInt(tel)&&parseInt(firstTel)
                                        
                                        finalArray.forEach((x,i,arr)=>{
                                            if(parseInt(x.conversationWith)===parseInt(finalTel)){
                                                finalArray[i].conversation = resultArray_2
                                            }
                                        })
                                        if((conversationsArray.length-1)===i){
                                            console.log('all your conversations')
                                            return res.send({tel: tel, conversations: finalArray, message: 'all your conversations'})
                                        }      
                                    } 
                                })
                            })
                        } 
                        else if(conversationsArray.length===0){
                            console.log('conversationsArray.length===0')
                            return res.send({tel: tel, conversations: finalArray, message: 'conversationsArray.length===0'})
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

module.exports = router;