const express = require('express');
const router = express.Router();
const multer = require("multer")
const enableSettings = require("../../middleware/enable_settings")
const commonFunction = require("../../functions/commonFunctions")
const fieldErrors = require('../../functions/error')
const axios = require('axios');

router.use(process.env.subFolder+'api', enableSettings,  require('./liveStreaming'));
router.use(process.env.subFolder+'api', enableSettings,  require('./stories'));
router.use(process.env.subFolder+'api', enableSettings,  require('./reels'));
router.use(process.env.subFolder+'api', enableSettings,  require('./dashboard'))
router.use(process.env.subFolder+'api', enableSettings,  require('./auth'));
router.use(process.env.subFolder+'api', enableSettings,  require('./search'));
router.use(process.env.subFolder+'api', enableSettings,  require('./report'));
router.use(process.env.subFolder+'api', enableSettings,  require('./video'));
router.use(process.env.subFolder+'api', enableSettings,  require('./movies'));
router.use(process.env.subFolder+'api', enableSettings,  require('./channel'));
router.use(process.env.subFolder+'api', enableSettings,  require('./comment'));
router.use(process.env.subFolder+'api', enableSettings,  require('./like'));
router.use(process.env.subFolder+'api', enableSettings,  require('./rattings'))

router.use(process.env.subFolder+'api', enableSettings,  require('./follow'));
router.use(process.env.subFolder+'api', enableSettings,  require('./favourite'));
router.use(process.env.subFolder+'api', enableSettings,  require('./blog'));
router.use(process.env.subFolder+'api', enableSettings,  require('./user'));
router.use(process.env.subFolder+'api', enableSettings,  require('./watchLater'))
router.use(process.env.subFolder+'api', enableSettings,  require('./playlists'))
router.use(process.env.subFolder+'api', enableSettings,  require('./audio'))
router.use(process.env.subFolder+'api', enableSettings,  require('./artist'))
router.use(process.env.subFolder+'api', enableSettings,  require('./notifications'))
router.use(process.env.subFolder+'api', enableSettings,  require('./ads'))
router.use(process.env.subFolder+'api', enableSettings,  require('./messages'))


router.use(process.env.subFolder+'api/imagefetcher', async (req, res, next) => {
    const url = decodeURIComponent(req.query.url);
    var config = {
        method: 'get',
        url: url,
        responseType: 'stream'
    };
    axios(config)
      .then(async ( response) => {
            const body = await response.data;
            body.pipe(res);
      }).catch((err) => {
        console.log(err);
      })
})

router.use(process.env.subFolder+'api/contact',enableSettings,multer().none(), async (req, res, next) => {
    constant = require("../../functions/constant")
    let captchaToken = req.body.captchaToken
    if(req.appSettings['recaptcha_enable'] == 1  && !req.fromAPP){
        let isValidCaptcha = true;
        await commonFunction.checkCaptcha(req,captchaToken).then(result => {
        if(!result){
            isValidCaptcha = false;
        }
        }).catch(err => {
            isValidCaptcha = false;
            console.log(err,'error')
        })
        if(!isValidCaptcha){
            return res.send({ error: fieldErrors.errors([{ msg: constant.general.CAPTCHAVALIDATION }], true) }).end();
        }
    }
    const emailFunction = require("../../functions/emails")
    
    const globalModel = require("../../models/globalModel")
    await globalModel.custom(req, "SELECT vars,type FROM emailtemplates WHERE type = ?", ["contact"]).then(async resultsType => {
        if (resultsType) {
            const typeData = JSON.parse(JSON.stringify(resultsType))[0];
            let result = {}
            result.vars = typeData.vars
            result.type = "contact"

            result['usertitle'] = {}
            result['usertitle']["title"] = req.body.name
            result['usertitle']['type'] = "text"

            result['senderemail'] = {}
            result['senderemail']["title"] = req.body.email
            result['senderemail']['type'] = "text"

            result['message'] = {}
            result['message']["title"] = req.body.message
            result['message']['type'] = "text"

            result.ownerEmail = {language:"en"}
            result.toName = req.appSettings["contact_from_name"]
            result.toEmail = req.appSettings["contact_email_from"]
            result.disableFooter = true
            result.disableHeader = true
            emailFunction.sendMessage(req, result)
        }
    })
    res.send({message:constant.general.CONTACTSUCCESS})
});

router.use(process.env.subFolder+'api', enableSettings,  (req, res, next) => {
    return res.status(404).send({ error: [{ "message": "Invalid Request" }], status: 404 }).end()
});

module.exports = router;