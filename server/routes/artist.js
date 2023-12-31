const express = require('express');
const router = express.Router();
const controller = require("../controllers/artists")
const multer = require("multer")

router.get(process.env.subFolder+'mainsite/artists/:type',controller.browse);
router.get(process.env.subFolder+'mainsite/artist/:id',multer().none(),controller.view);

module.exports = router;