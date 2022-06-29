require('dotenv').config()
const express = require('express')
const router = express.Router()
const passportJwt = require('../controllers/passportJwt')
const connection = require('../controllers/mysql')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
router.get('/calls/:tel', passportJwt.passportJwt, async (req, res, next)=>{
    try{
        const tel = req.params.tel
        const table_name = 'calls_'+tel
        let sql = `
            SELECT * FROM ??
        `;
        connection.query(sql, table_name, (err, result, fields) => {
            if (err){
                console.log(err.message)
                return res.send({tel: false, avatar: null, contacts: false, message: 'database error'})
            } else{
                let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
                return res.send(resultArray)
            }
        });   
    }
    catch(err){
        res.send(err)
    }
})
// -----------------------------------------------------------------------------------------------
module.exports = router;