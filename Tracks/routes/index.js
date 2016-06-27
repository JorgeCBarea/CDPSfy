var express = require('express');
var router = express.Router();
var multer  = require('multer');

var tracks_dir = process.env.TRACKS_DIR || './media/';

var trackController = require('../controllers/track_controller');

router.get('/', function(req, res) {
  res.send('Bienvenido a tracks.cdpsfy.es');
});

router.post('/tracks', trackController.nuevoTrack);
router.post('/images', trackController.nuevaImagen);
router.get('/tracks/:name', trackController.serveTrack);
router.get('/images/:nameImagen', trackController.serveImagen);
router.delete('/tracks/:name', trackController.deleteTrack);
router.delete('/images/:nameImage', trackController.deleteImage);

module.exports = router;
