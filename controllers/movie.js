const validator = require("validator");
const MovieModel = require("../models/movie");
const pool = require("../database");
const fs = require('fs');
const path = require('path');

const controller = {
  
  //metodo para guardar una pelicula.
  save: async (req, res) => {
    //recoger los parametros de la peticion.
    const { name, año, id_categoria, descripcion } = req.body;

    //validar los datos.
    let validate_name = !validator.isEmpty(name);
    let validate_año = !validator.isEmpty(año);
    let validate_id_categoria = !validator.isEmpty(id_categoria) && validator.isInt(id_categoria);
    let validate_descripcion = !validator.isEmpty(descripcion);
    
    //cuando los datos son true, es decir que estan validos. seguimos el proceso
     if (
      validate_name &&
      validate_año &&
      validate_id_categoria &&
      validate_descripcion
    ) {
      //crear objeto de usuario.
      const movie = new MovieModel();

      //asignar valores al objeto de usuario.
      movie.name = name;
      movie.año = año;
      movie.id_categoria = id_categoria;
      movie.descripcion = descripcion;
      movie.image = null;
      movie.video = null;
      
      //guardar en base de datos.
      pool.query(
        `INSERT INTO movies VALUES ('','${movie.name.toUpperCase()}','${movie.año}','${movie.id_categoria}','${movie.descripcion}','${movie.image}','${movie.video}')`,
        (err, result) => {
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
            //devolver respuesta cuando se ha insertado correctamente.
            return res.status(200).send({
              status: "success",
              message: "exitoso",
              result,
              movie,
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

  
  //metodo para actualizar datos de una pelicula.  //este metodo solo debe funcionar si el usuario tiene el token.
  update: async (req, res)=>{

    //crear middleware, ok realizado.

    //recoger los datos del usuario.
    const { name, año, id_categoria, descripcion } = req.body;
    //recogo el numero de id que me llega desde la url.
    const {movieId} = req.params;

    //validar los datos.
    try {
    !validator.isEmpty(name);
    !validator.isEmpty(año);
    !validator.isEmpty(id_categoria) && validator.isInt(id_categoria);
    !validator.isEmpty(descripcion);
    } catch (err) {
      res.status(200).send({
        status: "error",
        message: "faltan datos por enviar"
      })
    }
    
    //buscar y actualizar pelicula.
    pool.query(
      `UPDATE movies SET name = '${name}', año = '${año}', id_categoria = '${id_categoria}', descripcion = '${descripcion}' where id = ${movieId}`,
      async (err, result) => {
        if (err) {
          console.log(err);
          //devolver respuesta de error al guardar en base de datos.
          return res.status(200).send({
            status: "error",
            message:
              "no se pudo completar el registro de la pelicula en bd.",
          });
        }
        if (result["affectedRows"] > 0) {
          
          //buscar el registro ya actualizado.
          const movieUdpate = await pool.query(`select * from movies where id = ${movieId}`);

          
          //devolver respuesta cuando se ha insertado correctamente.
          return res.status(200).send({
            status: "success",
            message: "pelicula actualizada.",
            movieUdpate
          });
        }
      }
    );
  },

  //metodo para subir imagen y video de la pelicula
  uploadImage: (req, res)=>{

    //configurar el modulo de connect multiparty.hecho en  /routes/user.js

    //recoger el fichero de la peticion.
    let file_name = 'Imagen no subida.';
    let file_video = 'Video no subido';
    
    //return console.log(req.files);
    if(!req.files){
      res.status(500).send({
        status: "error",
        message: file_name,
        file_video
      })
    }

    //conseguir el nombre y la extension del archivo imagen.
    let file_path = req.files.image.path;
    let file_split = file_path.split('\\');

    //conseguir el nombre y la extension del archivo video.
    let file_path_video = req.files.video.path;
    let file_split_video = file_path_video.split('\\');
    
    //nombre del archivo con extension imagen
    let file_final = file_split[file_split.length -1];

    //nombre del archivo con extension video
    let file_final_video = file_split_video[file_split_video.length -1];


    //parto el stagin por el punto para obtener la extension del archivo imagen.
    let file_ext_split = file_final.split('\.');

    //parto el stagin por el punto para obtener la extension del archivo video.
    let file_ext_split_video = file_final_video.split('\.');
    
    
    //extension del archivo.
    let file_ext = file_ext_split[file_ext_split.length -1];

    //extension del archivo video.
    let file_ext_video = file_ext_split_video[file_ext_split_video.length -1];

    //comprobar extension (solo imagenes), si no es valida borrar fichero subido.
    if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif' || file_ext_video != 'mp4'){
      
      fs.unlink(file_path, (err)=>{
        fs.unlink(file_path_video, (err)=>{
            res.status(500).send({
              status: "error",
              message: "las extensiones de los archivos no son validas"
            })
    
          })

      })
    }else{

    //recogo el numero de id que me llega desde la url.
    const {movieId} = req.params;
    
    
    //buscar y actualizar documento.
    pool.query(
      `UPDATE movies SET image = '${file_final}', video = '${file_final_video}' where id = ${movieId}`,
      async (err, result) => {
        if (err) {
          console.log(err);
          //devolver respuesta de error al guardar en base de datos.
          return res.status(200).send({
            status: "error",
            message:
              "no se pudo completar el registro de la pelicula en bd.",
          });
        }
        if (result["affectedRows"] > 0) {
          
          //buscar el registro ya actualizado.
          const movieUdpate = await pool.query(`select * from movies where id = ${movieId}`);

          
          //devolver respuesta cuando se ha insertado correctamente.
          return res.status(200).send({
            status: "success",
            message: "pelicula actualizada con imagen",
            movieUdpate,
          });
        }
      }
    );

    }

  },

  //metodo para traer la imagen de la pelicula.
  image: (req, res) => {

    var fileName = req.params.fileName;
    var pathFile = './uploads/movies/'+fileName;
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

  //metodo para traer el video de la pelicula.
  video: (req, res) => {

    var fileName = req.params.fileName;
    var pathFile = './uploads/movies/'+fileName;
    fs.access(pathFile, fs.constants.W_OK, (err) => {
      if(!err){
        return res.sendFile(path.resolve(pathFile));
      }else{
        return res.status(404).send({
          message: 'el video no existe'
        });
      }
    });

  },

  //metodo para traer todas las peliculas de la base de datos.
  getMovies: async (req, res) => {

    //buscar usuarios
    const movies = await pool.query(
      `select * FROM movies`
    );
    //si lo encuentra.
    if (movies.length) {

      return res.status(200).send({
        message: "success",
        movies
    });

    }else{
      //devolver los datos.
      return res.status(200).send({
          message: "no existen peliculas en la base de datos.",
      });
    }
     
  },

  //metodo para sacar solo una pelicula por el id.
  getMovie: async (req, res) => {
    
    //recogo el numero de id que me llega desde la url.
    const {movieId} = req.params;
    
    //busco en base de datos el usuario con ese id
    const movie = await pool.query(
      `select * FROM movies WHERE id = ${movieId}`
    );
    //si lo encuentra.
    if (movie.length) {

      return res.status(200).send({
        message: "success",
        movie
    });

    }else{
      //devolver los datos.
      return res.status(404).send({
          message: "no found.",
      });
    }

     
  },

  //metodo para sacar peliculas por categoria.
  getMovieCategory: async (req, res)=>{
     //recogo el numero de id que me llega desde la url.
     const {categoryId} = req.params;

     //busco en base de datos el usuario con ese id
    const movie = await pool.query(
      `SELECT movies.id,movies.name as nombre ,movies.id_categoria, 
      movies.descripcion,movies.image,movies.video, categorias.name as nombre_categoria
      FROM movies INNER JOIN categorias ON(movies.id_categoria = categorias.id)
      WHERE categorias.id = ${categoryId};`
    );
    //si lo encuentra.
    if (movie.length) {

      return res.status(200).send({
        status: "ok",
        message: "success",
        movie
    });

    }else{
      //devolver los datos.
      return res.status(200).send({
          status: "error",
          message: "no existen peliculas de esa categoria en la base de datos.",
      });
    }
  }

};

module.exports = controller;