//En el lado del servidor, se cogerán las rutas, y se pondrán los módulos necesarios de node
"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const password = "4102";

const app = express();

//Configuración de los ficheros estáticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

//Configuración del body parser
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", function(request, response){
    response.status(200);
    response.redirect("/ej4.html");
});

//"valid: true" si coinciden, "valid: false" si no.
app.get("/checkPassword", function(request, response){
    response.json({valid: request.query.password === password});
});

// Inicio del servidor
app.listen(3000, function (err) {
    if (err) {
        console.log(`Error al abrir el puerto 3000: ${err}`);
    } else {
        console.log("Servidor escuchando en el puerto 3000.");
    }
});