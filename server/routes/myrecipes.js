const express = require('express');
const router = express.Router();
const controller = require('../controllers/myrecipes');
const multer = require('multer');
const middlewareEnable = require('../middleware/enable');

router.use(
  process.env.subFolder + ':lng?/myrecipe/:id',
  (req, res, next) => {
    middlewareEnable.isEnable(req, res, next, 'myrecipes', 'view');
  },
  controller.view
);
router.use(
  process.env.subFolder + ':lng?/myrecipes',
  (req, res, next) => {
    console.log(req);
    middlewareEnable.isEnable(req, res, next, 'myrecipes', 'view');
  },
  multer().none(),
  controller.browse
);

module.exports = router;
