const express = require("express");
const mysql = require("mysql");
const expressValidator = require("express-validator")
const path = require("path");
const bodyParser = require("body-parser");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "ej3"
}, 3000);

const app = express();

//Configurada la vista de los ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));


//Configurados los ficheros estáticos del proyecto
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

//Se configura el expressValidator
app.use(expressValidator());

//Se configura el bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

class DAO {
    constructor(pool) {
        this.pool = pool;
    }

    insertarReceta(receta, callback) {
        console.log("Entra el insertar receta del DAO");
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                let sql = "INSERT INTO receta(id, nombre, preparacion) VALUES ('', ?, ?)";
                let elems = [receta.nombre, receta.preparacion];
                connection.query(sql, elems, function (err, result) {

                    if (err) {
                        callback(err, null);
                    } else {
                        let query = "INSERT INTO ingredientes(id, nombre, cantidad, idReceta) VALUES ";
                        let elems = [];
                        receta.ingredientes.forEach(function (ingrediente, i) {
                            query += "('', ?, ?, ?)";
                            if (i !== receta.ingredientes.length - 1) {
                                query += ", ";
                            }
                            else {
                                query += ";"
                            }
                            elems.push(ingrediente.nombre);
                            elems.push(ingrediente.cantidad);
                            elems.push(result.insertId);
                        });

                        console.log(query);
                        console.log(elems);

                        connection.query(query, elems, function (err, result2) {
                            connection.release();
                            if (err) {
                                console.log("Error la consulta del insertar receta del DAO");
                                callback(err, null);
                            } else {
                                console.log("La consulta del insertar receta del DAO ha ido bien");
                                callback(err, "Receta e ingredientes insertados correctamente");
                            }
                        });
                    }
                });
            }
        });
    }

    getRecetas(callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err, null);
            }
            else {
                let query = "SELECT * FROM receta"
                connection.query(query, function (error, result) {
                    if (error) {
                        console.log("Error la consulta del get recetas del DAO");
                        callback(err, null);
                    }
                    else {
                        console.log("La consulta del get recetas del DAO ha ido bien");
                        callback(null, result);
                    }
                });
            }
        });
    }
};

const dao = new DAO(pool);


app.get("/", function (request, response) {
    response.status(200);
    response.redirect("/recetas");
    response.end();
});

app.get("/recetas", function (request, response) {
    response.status(200);

    dao.getRecetas(function (error, listaRecetas) {
        if (error) {
            console.log("Error al obtener las recetas en el get de /recetas");
            response.render("recetas", { recetas: [], error: "Error al obtener las recetas" });
        }
        else {
            console.log("Todo ha ido bien en el get de /recetas");
            response.render("recetas", { recetas: listaRecetas, error: null });
        }
    });


});

app.get("/anadirReceta", function (request, response) {
    response.status(200);
    response.redirect("/recetas");
});

app.post("/anadirReceta", function (request, response) {
    response.status(200);
    request.checkBody("nombre", "El nombre de la receta está vacío").notEmpty();
    request.checkBody("preparacion", "Las instrucciones de preparación están vacías").notEmpty();
    request.checkBody("ingredientes", "El campo de los ingredientes está vacío").notEmpty();
    request.checkBody("cantidad", "El campo de la cantidad de los ingredientes está vacío").notEmpty();

    request.getValidationResult().then(function (result) {
        if (result.isEmpty()) {
                let receta = { nombre: "", preparacion: "", ingredientes: [] };
                receta.nombre = request.body.nombre;
                receta.preparacion = request.body.preparacion;
                let ingraux = request.body.ingredientes.split(",");
                let cantaux = request.body.cantidad.split(",");

                if (ingraux.length !== cantaux.length || cantaux.some(n => isNaN(Number(n)))) {
                    console.log("Error en los datos de los ingredientes");
                    dao.getRecetas(function (error, listaRecetas) {
                        if (error) {
                            response.render("recetas", { recetas: [], error: "Error al obtener las recetas y al introducir los ingredientes" });
                        }
                        else {
                            response.render("recetas", { recetas: listaRecetas, error: "Error al introducir los ingredientes" });
                        }
                    });
                }
                else {
                    ingraux.forEach(function (ingr, i) {
                        let ingrediente = {};
                        ingrediente.nombre = ingr;
                        ingrediente.cantidad = Number(cantaux[i]);
                        console.log("Ingrediente " + Number(i+1) + ": " + ingrediente);
                        receta.ingredientes.push(ingrediente);
                    });
                    
                    dao.insertarReceta(receta, function(error, resultado){
                        if(error) {
                            console.log("El insertar receta ha ido mal");
                            dao.getRecetas(function (error, listaRecetas) {
                                if (error) {
                                    response.render("recetas", { recetas: [], error: "Error al obtener las recetas y insertar la receta" });
                                }
                                else {
                                    response.render("recetas", { recetas: listaRecetas, error: "Error al insertar la receta" });
                                }
                            });
                        }
                        else{
                            console.log("El insertar receta ha ido bien");
                            response.redirect("/recetas");
                        }
                    });
                    
                }
            
        } else {
            dao.getRecetas(function (error, listaRecetas) {
                if (error) {
                    response.render("recetas", { recetas: [], error: "Error al obtener las recetas. También al añadir la receta" });
                }
                else {
                    response.render("recetas", { recetas: listaRecetas, error: "Algunos campos están vacíos" });
                }
            });
        }

    });

});


app.listen(3000, function (err) {
    if (err) {
        console.error("No se pudo inicializar el servidor: "
            + err.message);
    } else {
        console.log("Servidor arrancado en el puerto 3000");
    }
});

