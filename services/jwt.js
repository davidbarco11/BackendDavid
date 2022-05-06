const jwt = require('jwt-simple');
const moment = require('moment');
const secret = process.env.ACCESS_TOKEN_SECRET;

exports.createToken = (user) => {

  console.log(user);
 
    var payload = {
      sub: user[0].id,
      name: user[0].name,
      surname: user[0].surname,
      email: user[0].email,
      role: user[0].role,
      image: user[0].image,
      iat: moment().unix(),
      exp: moment().add(30, 'days').unix(),
      

    };
    
    return jwt.encode(payload, secret)

}