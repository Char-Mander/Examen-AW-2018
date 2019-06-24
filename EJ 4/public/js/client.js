//En el lado del cliente, se enviarán las peticiones correspondientes y se realizarán las acciones de JQuery (?)

"use strict";

function mostrarAcceso(selector) {
    let permitido = $(selector);
    permitido.show();
    setTimeout(() => {
        permitido.hide();
    }, 1000);
}

function accesoPermitido() {
    mostrarAcceso("#permitido");
}

function accesoDenegado() {
    mostrarAcceso("#denegado");
}

$(() => {
    let combinacion = "";

    //Añadir el número pulsado a la combinación
    $("#teclado > .tecla").on("click", (event) => {
        let pulsado = $(event.target);
        combinacion += pulsado.data("numero");
        $("#display").text(combinacion);
        setTimeout(() => {
            if (combinacion.length === 4) {
                alert("Número introducido: " + combinacion);
                $.ajax({
                    method: "GET",
                    url: "/checkPassword",
                    data: { password: combinacion },
                    //Si el valid devuelto es true
                    success: function (data, textStatus, jqXHR) {
                        if(data.valid){
                            accesoPermitido();
                        } 
                        else {
                            accesoDenegado();
                        }
                    },
                });
                combinacion = "";
                $("#display").text("");
            }
        }, 200);

    });

    //Borrar la combinación escrita hasta el momento
    $(".borrar").on("click", (evento) => {
        combinacion = "";
        $("#display").text(combinacion);
    });

});