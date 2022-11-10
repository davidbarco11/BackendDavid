const validator = require("validator");
const UserModel = require("../models/user");
const pool = require("../database");
const bcrypt = require("bcrypt-node");
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');

const controller = {


  validarToken : (req, res) => {
    return res.status(200).send({
      message: 'autorizado',
    })
    
  },

  //ejemplo de como se debe hacer en postman para cargar la ruta:
  //      http://localhost:3000/api/probando
  probando: (req, res) => {
    return res.status(200).send({
      message: "soy el metodo probando",
    });
  },

  //metodo para guardar un usuario.
  save: async (req, res) => {
    //recoger los parametros de la peticion.
    const { name, surname, email, password } = req.body;

    //validar los datos.
    let validate_name = !validator.isEmpty(name);
    let validate_surname = !validator.isEmpty(surname);
    let validate_email = !validator.isEmpty(email) && validator.isEmail(email);
    let validate_password = !validator.isEmpty(password);

    //cuando los datos son true, es decir que estan validos. seguimos el proceso
    if (
      validate_name &&
      validate_surname &&
      validate_email &&
      validate_password
    ) {
      //crear objeto de usuario.
      const user = new UserModel();

      //asignar valores al objeto de usuario.
      user.name = name;
      user.surname = surname;
      user.email = email.toLowerCase();
      user.password = password;
      user.role = "admin";
      user.image = null;

      //commprobar si el usuario existe.
      const usuarioExiste = await pool.query(
        `select email FROM users WHERE email = '${user.email}'`
      );

      //si existe un usuario, informar de que ya está un usuario con el mismo email.
      if (usuarioExiste.length) {
        return res.status(200).send({
          status: "email existe",
          message: "el email ya existe en base de datos.",
        });
      } else {
        //sino existe, cifrar contraseña y guardarlo.
        bcrypt.hash(user.password, null, null, (err, hash) => {
          //si la ha cifrado correctamente, asignamos el hash a la variable password.
          user.password = hash;

          //guardar en base de datos.
          pool.query(
            `INSERT INTO users VALUES ('','${user.name}','${user.surname}','${user.email}','${user.password}','${user.role}','${user.image}')`,
            (err, result) => {
              if (err) {
                //devolver respuesta de error al guardar en base de datos.
                return res.status(400).send({
                  status: "error",
                  message:
                    "no se pudo completar el registro del usuario en bd.",
                });
              }
              if (result["affectedRows"] > 0) {
                //devolver respuesta cuando se ha insertado correctamente.
                return res.status(200).send({
                  status: "success",
                  message: "registro de usuarios exitoso.",
                  user,
                });
              }
            }
          );
        });
      }
    } else {
      return res.status(500).send({
        status: "datos invalidos",
        message: "datos invalidos",
      });
    }
  },

  //metodo de login del usuario.
  login: async (req, res) => {
      //recoger los parametros de la peticion.
      const {email, password, getToken} = req.body;

      //validar los datos.
      let validate_email = !validator.isEmpty(email) && validator.isEmail(email);
      let validate_password = !validator.isEmpty(password);

      if (validate_email && validate_password){
      //buscar usuarios que coincidan con el email.
      const usuario = await pool.query(
        `select * FROM users WHERE email = '${email.toLowerCase()}'`
      );
      //si lo encuentra.
      if (usuario.length) {

        const passwordEncrypted = usuario[0]['password']

        //comprobar la contraseña (coincidencia de email y password /bcrypt) .
        bcrypt.compare(password, passwordEncrypted, (err,checks) => {
              
         if(checks){

            //si es correcto, generar el token jwt.
            if(getToken){
             
            //limpiar el objeto para no devolver la password.
            usuario[0]['password'] = undefined;  
            //devolver respuesta
            return res.status(200).send({
                message: "listo",
                token: jwt.createToken(usuario),
                usuario
            });
            }else{
                //limpiar el objeto para no devolver la password.
                usuario[0]['password'] = undefined;

                //devolver respuesta
                return res.status(200).send({
                    message: "listo",
                    usuario
                });
            }

         }else{
            return res.status(200).send({
                status: "error",
                message: "las credenciales no son correctas" 
            });
         }    

        });
        
      }else{
        //devolver los datos.
        return res.status(200).send({
            message: "error al intentar identificarse",
        });
      }

      }else{
        return res.status(500).send({
            status: "error",
            message: "datos invalidos",
          });
      }
  },

  //metodo para actualizar datos de un usuario.  //este metodo solo debe funcionar si el usuario tiene el token.
  update: async (req, res)=>{

    //crear middleware, ok realizado.

    //recoger los datos del usuario.
    const {name,surname,email,password} = req.body
    //recoder el id del usuario que devolví del token.
    const idUser = req.user.sub;

    
    //validar los datos.
    try {
    !validator.isEmpty(name);
    !validator.isEmpty(surname);
    !validator.isEmpty(email) && validator.isEmail(email);

    } catch (err) {
      res.status(200).send({
        status: "error",
        message: "faltan datos por enviar"
      })
    }
    
    //eliminar propiedades innecesarias.
    delete password;

    //comprobar si el email es unico.
    if(req.user.email != email){

      //buscar usuarios que coincidan con el email.
      const usuario = await pool.query(
        `select * FROM users WHERE email = '${email.toLowerCase()}'`
      );
      //si lo encuentra.
      if (usuario.length && usuario[0].email == email) {
       //devolver los datos.
       return res.status(200).send({
        message: "el email no puede ser modificado",
        }); 
      }
    }
    
    //buscar y actualizar documento.
    pool.query(
      `UPDATE users SET name = '${name}', surname = '${surname}', email = '${email}' where id = ${idUser}`,
      async (err, result) => {
        if (err) {
          console.log(err);
          //devolver respuesta de error al guardar en base de datos.
          return res.status(200).send({
            status: "error",
            message:
              "no se pudo completar el registro del usuario en bd.",
          });
        }
        if (result["affectedRows"] > 0) {
          
          //buscar el registro ya actualizado.
          const userUdpate = await pool.query(`select * from users where id = ${idUser}`);

          //eliminar la propiedad password para no devolverla en los datos del usuario al frontend.
          delete userUdpate[0].password;

          
          //devolver respuesta cuando se ha insertado correctamente.
          return res.status(200).send({
            status: "success",
            message: "usuario actualizado.",
            userUdpate,
            //actualizar el token.
            token: jwt.createToken(userUdpate)
          });
        }
      }
    );
  },

  //metodo para subir avatar de
  uploadAvatar: (req, res)=>{

    //configurar el modulo de connect multiparty.hecho en  /routes/user.js

    //recoger el fichero de la peticion.
    let file_name = 'Avatar no subido.';
    
    if(!req.files){
      res.status(500).send({
        status: "error",
        message: file_name
      })
    }

    //conseguir el nombre y la extension del archivo.
    let file_path = req.files.file0.path;
    let file_split = file_path.split('\\');
    
    //nombre del archivo con extension
    let file_final = file_split[file_split.length -1];

    //parto el stagin por el punto para obtener la extension del archivo.
    let file_ext_split = file_final.split('\.');
    
    
    //extension del archivo.
    let file_ext = file_ext_split[file_ext_split.length -1];

    //comprobar extension (solo imagenes), si no es valida borrar fichero subido.
    if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
      
      fs.unlink(file_path, (err)=>{
        res.status(500).send({
          status: "error",
          message: "extension del archivo no es valida"
        })

      })
    }else{

    //sacar el id del usuario identificado.
    const userId = req.user.sub;
    
    //buscar y actualizar documento en base de datos.
    file_final
    //buscar y actualizar documento.
    pool.query(
      `UPDATE users SET image = '${file_final}' where id = ${userId}`,
      async (err, result) => {
        if (err) {
          console.log(err);
          //devolver respuesta de error al guardar en base de datos.
          return res.status(200).send({
            status: "error",
            message:
              "no se pudo completar el registro del usuario en bd.",
          });
        }
        if (result["affectedRows"] > 0) {
          
          //buscar el registro ya actualizado.
          const userUdpate = await pool.query(`select * from users where id = ${userId}`);

          
          //devolver respuesta cuando se ha insertado correctamente.
          return res.status(200).send({
            status: "success",
            message: "usuario actualizado con imagen",
            userUdpate,
            //actualizar el token.
            //token: jwt.createToken(userUdpate)
          });
        }
      }
    );

    }

  },

  //metodo para traer la imagen del usuario, o avatar.
  avatar: (req, res) => {

    var fileName = req.params.fileName;
    var pathFile = './uploads/users/'+fileName;
    fs.access(pathFile, fs.constants.W_OK, (err) => {
      if(!err){
        return res.sendFile(path.resolve(pathFile));
      }else{
        return res.status(404).send({
          message: 'La imagen no existe'
        });
      }
    });

  },

  //metodo para traer todos los usuarios de la base de datos.
  getUsers: async (req, res) => {

    //buscar usuarios
    const usuarios = await pool.query(
      `select * FROM users`
    );
    //si lo encuentra.
    if (usuarios.length) {

      return res.status(200).send({
        message: "success",
        usuarios
    });

    }else{
      //devolver los datos.
      return res.status(200).send({
          message: "no existen usuario en la base de datos.",
      });
    }
     
  },

  //metodo para sacar solo un usuario por el id.
  getUser: async (req, res) => {
    
    //recogo el numero de id que me llega desde la url.
    const {userId} = req.params;
    
    //busco en base de datos el usuario con ese id
    const usuario = await pool.query(
      `select * FROM users WHERE id = ${userId}`
    );
    //si lo encuentra.
    if (usuario.length) {

      return res.status(200).send({
        message: "success",
        usuario
    });

    }else{
      //devolver los datos.
      return res.status(200).send({
          message: "no existe el usuario en la base de datos.",
      });
    }

     
  }

};

module.exports = controller;
