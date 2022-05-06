const jwt = require('jwt-simple');
const moment = require('moment');
const secret = process.env.ACCESS_TOKEN_SECRET;


exports.authenticated = (req,res,next) => {
    
    //comprobar si llega la autorizacion en el header.
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'la peticion no tiene la cabecera de authorization'
        });
    }

    //limpiar el token y quitar comillas.
    const token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        //decodificar token.
        var payload = jwt.decode(token, secret);
        
        //comprobar si el token ha expirado.
        if(payload.exp <= moment().unix()) {
            return res.status(404).send({
                message: 'el token ha expirado.'
            });  
        }
        
    } catch (error) {
        return res.status(404).send({
            message: 'el token no es válido.'
        });
    }

    //adjuntar usuario identificado a request.
    req.user = payload;
    
    //pasar el siguiente metodo, despues de que ha pasado el middleware.
    next();
}