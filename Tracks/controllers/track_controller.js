var fs = require('fs');

//Subimos una nueva cancion (TRACK)
exports.nuevoTrack = function(req, res){
        var nas = "/mnt/nas/";
        //STACKOVERFLOW

        //var name = "";
        var mp3PATH = '';
        var url = '';
        var name = '';
        var mp3TMP;
        var n = 0;
        var body = '';
        req.on('data', function(data){
                body += data;
                if(n == 0){
                        var random = Math.floor((Math.random()*100)+1);
                        name = new Date().getTime() + random + ".mp3";
                        mp3PATH = nas + name;
                        mp3TMP = fs.createWriteStream(mp3PATH);
                        mp3TMP.write(data);
                        n++;
                }
                else{
                        mp3TMP.write(data);
               }
        });


        req.on('end', function(){
                mp3TMP.end();
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(name);
        });

};

//Subimos una nueva cancion (TRACK)
exports.nuevaImagen = function(req, res){
        var nas = "/mnt/nas/";
        //STACKOVERFLOW

        //var name = "";
        var mp3PATH = '';
        var url = '';
        var name = '';
        var mp3TMP;
        var n = 0;
        var body = '';
        req.on('data', function(data){
                body += data;
                if(n == 0){
                        var random = Math.floor((Math.random()*100)+1);
                        name = new Date().getTime() + random + ".png";
                        mp3PATH = nas + name;
                        mp3TMP = fs.createWriteStream(mp3PATH);
                        mp3TMP.write(data);
                        n++;
                }
                else{
                        mp3TMP.write(data);
                }
        });
      

        req.on('end', function(){
                mp3TMP.end();
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(name);
        });

};



//Borramos las canciones
exports.deleteTrack = function(req, res){
	var nas = "/mnt/nas/";
	var name = req.params.name;
	var url = nas + name;
	fs.unlink(url);
	res.status(200);//status OK
	console.log("Cancion borrada: " + name);
};
//Borramos las imagenes
exports.deleteImage = function(req, res){
        var nas = "/mnt/nas/";
        var name = req.params.nameImage;
        var url = nas + name;
        fs.unlink(url);
        res.status(200);//status OK
        console.log("Foto borrada: " + name);
};


//Servimos canciones
exports.serveTrack = function(req, res){
	var nametmp = req.params.name;
	var name = nametmp.toString();
	res.sendFile(name, {root: '../mnt/nas'});
};

exports.serveImagen = function(req, res){
	var nametmp = req.params.nameImagen;
	var name = nametmp.toString();
	res.sendFile(name, {root: '../mnt/nas'});
};

