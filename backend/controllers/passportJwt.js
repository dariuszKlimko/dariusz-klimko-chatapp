require('dotenv').config()
const passport = require('passport')
const passportJWT = require("passport-jwt")
const JwtStrategy  = passportJWT.Strategy
const connection = require('../controllers/mysql')
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
const headerExtractor = function(req) {
    const accessToken = req.cookies.accessToken;
    return accessToken;
};

passport.use(new JwtStrategy({
    jwtFromRequest: headerExtractor,
    secretOrKey   : process.env.ACCESS_TOKEN_SECRET
}, function(jwtPayload, done) {
    let sql = `
        SELECT * FROM users
        WHERE 
          uid = '${jwtPayload.uid}'
    `;
    connection.query(sql, (err, result, fields) => {
        if (err){ 
            console.log(error, 'error')
            return done(err, false);
        }
        else if (result){
            let resultArray = Object.values(JSON.parse(JSON.stringify(result)))
            if(resultArray.length !== 0){
                return done(null, resultArray[0].tel);
            } else{
                return done(null, false);
            }
        } else{ 
            return done(null, false);
        }
    });
}));

const middleware = {
    passportJwt: passport.authenticate('jwt', { session: false})
}

module.exports = {passportJwt: middleware.passportJwt}