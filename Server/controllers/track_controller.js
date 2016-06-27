var fs = require('fs');
var track_model = require('./../models/model');
//var needle = require('needle');
var request = require('request');

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	var track = track_model.Track;
	track.findAll().then(function(tracks){
		res.render('tracks/index', {tracks: tracks});
	})
	
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	var track = track_model.Track;
	track.findById(req.params.trackId).then(function(track){
		console.log(track.name);
		console.log(track.url);
		console.log("En show la url de la imagen es"+ track.urlImage);
		res.render('tracks/show', {track:track}); 

	});
};

// Escribe una nueva canción en el registro de canciones.
// TODO:
// - Escribir en tracks.cdpsfy.es el fichero de audio contenido en req.files.track.buffer
// - Escribir en el registro la verdadera url generada al añadir el fichero en el servidor tracks.cdpsfy.es
exports.create = function (req, res) {
	//Definimos las variables
	var track = req.files.track;
	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];

	// Aquí debe implementarse la escritura del fichero de audio (track.buffer) en tracks.cdpsfy.es
	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
	//var url_tracks = 'http://10.1.2.12/tracks/'+name; // CREO QUE NO SIRVE PARA NADA ESTA VARIABLE
	//var url = 'http://tracks.cdpsfy.es/tracks' + name;
	var urlPost = 'http://10.1.1.1/tracks';
	//var urlPost = 'http://www.tracks.cdpsfy.es:80/tracks';
	var url = '';
	var image = req.files.image;
	var urlImage="";
	var formData = {
				filename : name+".mp3", //Le he puesto mp3 por que si, en realidad habria que ver cual es la verdadera extension
				buffer: track.buffer
			
		};
	if(!image){
		
		//Peticion POST para guardar la cancion
		request.post({url: urlPost, formData: formData}, function optionalCallback(err, httpResponse, body){
			console.log("Entrado");
			if (err) return console.error('ERROR. HA OCURRIDO UN ERROR AL HACER EL POST:' + err + '\n');
			console.log('Uploaded');
			//var urlTrack = 'http://www.tracks.cdpsfy.es:80/tracks/'+body;
			var urlTrack = 'http://10.1.1.1/tracks/'+body;
			console.log('La urlTrack es: ' + urlTrack);
			url = urlTrack;
			console.log('La url es: ' + url);
			//Escribe los metadatos en el registro
			//Si guardo en el registro y hago res.redirect aqui la cancion se devuelve con get pero no aparecen los controles de la musica
			track_model.Track.build({name: name, url: urlTrack, urlImage: urlImage}).save();
			res.redirect('/tracks');
		});
	}
	else{
		
		var idImage = image.name.split('.')[0];
		var nameImage = image.originalname.split('.')[0];
		
		var formDataImage = {
			filename: nameImage+".png",
			buffer: image.buffer
		};
		
		//urlImage = 'http://10.1.2.12:3000/images/'+body;
		var guardado = false;
		request.post({url: urlPost, formData: formData}, function optionalCallback(err, httpResponse, body){
			console.log("Entrado");
			if (err) return console.error('ERROR. HA OCURRIDO UN ERROR AL HACER EL POST:' + err + '\n');
			var urlTrack = 'http://10.1.1.1/tracks/'+body;
			url = urlTrack;
			guardado = true;
			console.log("Primer post guardado es:"+ guardado);
			console.log('Uploaded');

			if(guardado){
                        urlPost = 'http://10.1.1.1/images';
                        request.post({url: urlPost, formData: formDataImage}, function optionalCallback(err, httpResponse, body){
                                console.log("Segudo post Entrado");
                                if (err) return console.error('ERROR. HA OCURRIDO UN ERROR AL HACER EL POST:' + err + '\n');
                                console.log('Uploaded');
                                var urlImg = 'http://10.1.1.1/images/'+body;
                                urlImage = urlImg;
                                console.log('La url es: ' + url);
                                //Escribe los metadatos en el registro
                                //Si guardo en el registro y hago res.redirect aqui la cancion se devuelve con get pero no aparecen l$
                                console.log("La url de la imagen es"+urlImage)
			        track_model.Track.build({name: name, url: url, urlImage: urlImage}).save();
                                res.redirect('/tracks');
                        });
                }

		});
		


	}
	//Si guardo en el registro y hago res.redirect la cancion no se devuelve con get pero si aparecen los controles de musica
	//console.log('La url que se guarda es: ' + url);
	//track_model.Track.build({name: name, url: url}).save();

	//res.redirect('/tracks');
};

// Borra una canción (trackId) del registro de canciones 
// TODO:
// - Eliminar en tracks.cdpsfy.es el fichero de audio correspondiente a trackId

exports.destroy = function (req, res) {
	var trackId = req.params.trackId;
	var URLdestroy = 'http://10.1.1.1/tracks/'+trackId;
	// Aquí debe implementarse el borrado del fichero de audio indetificado por trackId en tracks.cdpsfy.es
	track_model.Track.findById(trackId).then(function(track){
	
		var url = track.url;
		console.log('La url del track para borrar es'+url)
		request.del(url);
		if(track.urlImage != ""){
		request.del(track.urlImage);}
	//Borramos la entrada de la base de datos
	}).then(function(){
		track_model.Track.destroy({where: {'id': trackId}}).then(res.redirect('/tracks'));
	});

};
