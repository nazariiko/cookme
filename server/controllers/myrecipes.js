const commonFunction = require('../functions/commonFunctions');
const categoryModel = require('../models/categories');
const blogModel = require('../models/blogs');
const privacyModel = require('../models/privacy');
const userModel = require('../models/users');
const likeModel = require('../models/likes');
const favouriteModel = require('../models/favourites');
const readingTime = require('reading-time');
const recentlyViewed = require('../models/recentlyViewed');
const dateTime = require('node-datetime');
const privacyLevelModel = require('../models/levelPermissions');
const globalModel = require('../models/globalModel');

exports.browse = async (req, res) => {
  const queryString = req.query;
  await commonFunction.getGeneralInfo(req, res, 'myrecipes_browse');

  if (req.query.data) {
    res.send({ data: req.query });
    return;
  }
  res.query = req.query;
  req.query = {};
  console.log('server controller');
  req.app.render(req, res, '/myrecipes', req.query);
};

exports.view = async (req, res) => {
  await commonFunction.getGeneralInfo(req, res, 'myrecipes_view');

  req.query.id = req.params.id;

  if (req.query.data) {
    res.send({ data: req.query });
    return;
  }
  res.query = req.query;
  req.query = {};
  req.app.render(req, res, '/myrecipe', req.query);
};
