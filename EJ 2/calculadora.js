"use strict";

const express = require("express");
const path = require("path");
const expressValidator = require("express-validator");
const bodyParser = require("body-parser");


//  Creación de la aplicación express
const app = express();


//  Define las vistas ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "public", "views"));

//  Configuración de fichero estáticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

// Añadido el body parser
app.use(bodyParser.urlencoded({ extended: true }));

// Añadido el express validator
app.use(expressValidator());
var listacuentas=[];


app.get("/calcular", function (request, response) {
    response.status(200);
    console.log("Entra en el get");
    console.log("Cuentas en el get: " +  listacuentas);
    console.log("Tamaño de las cuentas: " + listacuentas.length);
    response.render("calculadora", { cuentas:  listacuentas, resultado: "", error: null });
});

app.post("/calcular", function (request, response) {
    response.status(200);
    console.log("Entra en el post");
    request.checkBody("numero1", "Primer número vacío").notEmpty();
    request.checkBody("numero2", "Segundo número vacío").notEmpty();
    request.checkBody("numero1", "Primer número vacío").isNumeric();
    request.checkBody("numero2", "Segundo número vacío").isNumeric();
    request.getValidationResult().then(function (result) {
        // El método isEmpty() devuelve true si las comprobaciones
        // no han detectado ningún error
        if (result.isEmpty()) {
            
            let n1 = Number(request.body.numero1);
            let simbolo = devolverSimbolo(request.body.simbolo);
            let n2 = Number(request.body.numero2);
            let res = realizarCuenta(n1, n2, request.body.simbolo);
            let cuenta = " " + n1 + " " + simbolo + " " + n2 + " = " + res; 
            console.log("Nueva cuenta obtenida en el post " + cuenta);
            console.log("Tamaño de las cuentas: " + listacuentas.length);
            listacuentas.push(cuenta);
            response.render("calculadora", {cuentas:  listacuentas, resultado: res, error: null});
        } else {
            response.render("calculadora", { cuentas:  listacuentas, resultado: res, error: "ERROR"});
        }
    });
});

app.get("/borrar", function(request, response){
    response.redirect("/calcular");
});

app.post("/borrar/:id", function(request, response){
    let index = Number(request.params.id);
    listacuentas.splice(index, 1);
    response.redirect("/calcular");
});

function realizarCuenta(numero1, numero2, simbolo){
    let res;
    switch(simbolo){
        case "suma": res = numero1 + numero2; 
        break;
        case "resta": res = numero1 - numero2;
        break;
        case "multiplicacion": res = numero1 * numero2;
        break;
        case "division": if(numero2!==0) res = numero1 / numero2;
        else res = null;
        break;
    }

    return res;
}

function devolverSimbolo(simbolo){
    let sim;
    switch(simbolo){
        case "suma": sim = "+"; 
        break;
        case "resta": sim = "-"; 
        break;
        case "multiplicacion": sim = "x"; 
        break;
        case "division": sim = "/"; 
        break;
    }

    return sim;
}


app.listen(3000, function (err) {
    if (err) {
        console.error("No se pudo inicializar el servidor");
    } else {
        console.log("Servidor arrancado en el puerto 3000");
    }
});
