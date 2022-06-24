const validator = require("validator");
const CategoryModel = require("../models/category");
const pool = require("../database");

const controller = {
  
  //metodo para guardar una categoria.
  save: async (req, res) => {
    //recoger los parametros de la peticion.
    const {name} = req.body;

    //validar los datos.
    let validate_name = !validator.isEmpty(name);

    //cuando los datos son true, es decir que estan validos. seguimos el proceso
     if (
      validate_name
    ) {
      //crear objeto de usuario.
      const category = new CategoryModel();

      //asignar valores al objeto de usuario.
      category.name = name.toUpperCase();
      
      //guardar en base de datos.
      pool.query(
        `INSERT INTO categorias VALUES ('','${category.name}')`,
        (err, result) => {
          if (err) {
            //devolver respuesta de error al guardar en base de datos.
            return res.status(200).send({
              status: "error",
              message:
                "no se pudo completar el registro de la categoria en base de datos.",
            });
          }
          if (result["affectedRows"] > 0) {
            //devolver respuesta cuando se ha insertado correctamente.
            return res.status(200).send({
              status: "success",
              message: "registro de categorias exitoso.",
              category,
            });
          }
        }
      );

    } else {
      return res.status(500).send({
        status: "error",
        message: "datos invalidos",
      });
    }
  },

  
  //metodo para actualizar datos de una categoria.  //este metodo solo debe funcionar si el usuario tiene el token.
  update: async (req, res)=>{

    //crear middleware, ok realizado.

    //recoger los datos de la categoria.
    const { name} = req.body;
    //recogo el numero de id que me llega desde la url.
    const {categoryId} = req.params;

    //validar los datos.
    try {
    !validator.isEmpty(name);
    } catch (err) {
      res.status(200).send({
        status: "error",
        message: "faltan datos por enviar"
      })
    }
    
    //buscar y actualizar categoria.
    pool.query(
      `UPDATE categorias SET name = '${name.toUpperCase()}' where id = ${categoryId}`,
      async (err, result) => {
        if (err) {
          console.log(err);
          //devolver respuesta de error al guardar en base de datos.
          return res.status(200).send({
            status: "error",
            message:
              "no se pudo completar el registro de la categoria en bd.",
          });
        }
        if (result["affectedRows"] > 0) {
          
          //buscar el registro ya actualizado.
          const categoryUdpate = await pool.query(`select * from categorias where id = ${categoryId}`);

          
          //devolver respuesta cuando se ha insertado correctamente.
          return res.status(200).send({
            status: "success",
            message: "categoria actualizada.",
            categoryUdpate
          });
        }
      }
    );
  },

  //metodo para traer todas las categorias de la base de datos.
  getCategories: async (req, res) => {

    //buscar usuarios
    const categories = await pool.query(
      `select * FROM categorias`
    );
    //si lo encuentra.
    if (categories.length) {

      return res.status(200).send({
        message: "success",
        categories
    });

    }else{
      //devolver los datos.
      return res.status(200).send({
          message: "no existen categorias en la base de datos.",
      });
    }
     
  },

  //metodo para sacar solo una pelicula por el id.
  getCategory: async (req, res) => {
    
    //recogo el numero de id que me llega desde la url.
    const {categoryId} = req.params;
    
    //busco en base de datos el usuario con ese id
    const category = await pool.query(
      `select * FROM categorias WHERE id = ${categoryId}`
    );
    //si lo encuentra.
    if (category.length) {

      return res.status(200).send({
        message: "success",
        category
    });

    }else{
      //devolver los datos.
      return res.status(200).send({
          message: "no existe la categoria en la base de datos.",
      });
    }

     
  }

};

module.exports = controller;