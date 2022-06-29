const connection = require('../controllers/mysql')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
const codeVerify = () =>{
  const date = Date.parse(new Date().toISOString())

  let sql = `
      SELECT tel, sms_code_expire_date, force_logout_code_expire_date FROM users
    `;
  connection.query(sql, async(err, result, fields) => {
    if (err){
      console.log(err.message, 'database error')
    } 
    // -------------------------------------------------------------------------------------
    else {
      result.forEach(x=>{
        if(x.sms_code_expire_date!=''){
          if(date>=parseInt(x.sms_code_expire_date)){
            sql = `
              UPDATE 
                users
              SET 
                sms_code = '0',
                sms_code_expire_date = null
              WHERE 
                tel = '${x.tel}'
            `;
            connection.query(sql, (err, result, fields) => {
              if (err){
                console.log(err.message, 'database error')
              } else{
                console.log(x.sms_code_expire_date,'sms_code_expire_date set to null, sms_code set to 0')
              }
            });
          }
        }
        else if(x.force_logout_code_expire_date!=''){
          if(date>=parseInt(x.force_logout_code_expire_date)){
            sql = `
              UPDATE 
                users
              SET 
                force_logout_code = '0',
                force_logout_code_expire_date = null
              WHERE 
                tel = '${x.tel}'
            `;
            connection.query(sql, (err, result, fields) => {
              if (err){
                console.log(err.message, 'database error')
              } else{
                console.log(force_expire_date,'force_logout_code_expire_date set to null, force_logout_code set to 0')
              }
            });
          }
        }
      })
    }
  })
}

module.exports = codeVerify