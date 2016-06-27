//BASE DE DATOS
var path = require('path');

//Cargar modelo ORM
var Sequelize = require('sequelize');

//Usar BDD SQLite
var sequelize = new Sequelize('database',null,null,{dialect: "sqlite", storage: "track.sqlite"});

//Importar la definicion de Track en track.js
var Track = sequelize.import(path.join(__dirname,'track'));

//Exportar la definicion de Track
exports.Track = Track;

//Crea e inicializa en DB
sequelize.sync().then(function(){
	// Devuelve el numero de filas en la tabla
	Track.count().then(function(count){
	
	});
});
