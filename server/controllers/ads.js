const commonFunction = require("../functions/commonFunctions")
const adsModel = require("../models/userAds")
const privacyModel = require("../models/privacy")
const categoryModel = require("../models/categories")
const oneTimePaypal = require("../functions/one-time-paypal")
const globalModel = require("../models/globalModel")
const notifications = require("../models/notifications")
const dateTime = require("node-datetime")
const constant = require("../functions/constant")
const socketio = require("../socket")

exports.recharge = async (req, res) => {
    let amount = req.query.amount
    req.session.orderId = null
    let gateway = req.query.gateway
    if (!amount || isNaN(amount) || !req.user) {
        await commonFunction.getGeneralInfo(req, res, "")
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if(gateway == "5"){
        if(parseFloat(amount) < 10){
            return res.send({error:req.i18n.t("Please enter minimum recharge value to 10.")})
        }
    }
    let fromBalance = req.query.fromBalance
    let fromVideo = req.query.fromVideo
    if(fromVideo){
        req.session.redirectURL = req.header('Referer')
    }
    let currentDate = dateTime.create().format("Y-m-d H:M:S")
    amount = parseFloat(amount).toFixed(2)
    const data = {}
    data["amount"] = amount
    data["returnUrl"] = `${process.env.PUBLIC_URL}/ads/successulPayment`
    data["cancelUrl"] = `${process.env.PUBLIC_URL}/ads/cancelPayment`
    data.title = req.i18n.t(constant.general.WALLETRECHARGE),
    req.session.adsAmount = amount
    req.session.fromBalance = fromBalance
    
    //delete all user pending orders
    await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'pending'",[req.user.user_id]).then(result => {
        
    })
    //create order
    await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:1,state:"pending",creation_date:currentDate,source_type:"wallet_user",source_id:req.user.user_id,summary:amount}, "orders").then(result => {
        if (result) {
            req.session.orderId = result.insertId
        } else {

        }
    })
    if (!req.session.orderId) {
        req.session.adsPaymentStatus = "fail"
        res.redirect("/dashboard/ads")
        res.end()
        return
    }
    data.sku = "user_wallet_"+req.session.orderId

    if(gateway == "5"){
        await commonFunction.qpayRefreshTOken(req).then(async result => {
            if(result.error){
                return res.send({error:"Something went wrong, please try again later.",errorMessage:result.error})
            }else{

                // create simple invoice
                await commonFunction.createInvoiceSimple(req,result,{price:amount,order_id:req.session.orderId}).then(resultInvoice => {
                    if(resultInvoice.error){
                        return res.send({error:"Something went wrong, please try again later.",errorMessage:resultInvoice.error})
                    }else{
                        return res.send({...resultInvoice,order_id:req.session.orderId})
                    } 
                })
                
            }
            
        })
    }else{
        return oneTimePaypal.init(req, res, data).then(result => {
            if (result.url) {
                req.session.ad_user_id = req.user.user_id
                req.session.adstokenUserPayment = result.token
                res.redirect(302, result.url)
                res.end()
            } else {
                req.session.adsPaymentStatus = "fail"
                res.redirect("/dashboard/ads")
                res.end()
            }
        }).catch(err => {
            console.log(err, ' ======= Upgrade ONETIME ERR ============')
            res.redirect("/dashboard/ads")
            res.end()
        })
    }
}

exports.qpayPaymentIPN = async (req,res,next) => {
    let order_id = req.query.order_id
    let qpay_payment_id = req.query.qpay_payment_id
    let order = null;
    // fetch order
    await globalModel.custom(req, "SELECT * FROM orders WHERE order_id = ?", [order_id]).then(async result => {
        if (result) {
            order = JSON.parse(JSON.stringify(result))[0]
        }
    })

    if(!order || order.state != "pending") {
        return res.send({status:false,message:"order ID not found in database - "+order_id})
    }

    // validate qpay payment IPN
    await commonFunction.qpayRefreshTOken(req).then(async result => {
        if(result.error){
            return res.send({error:"Something went wrong, please try again later.",errorMessage:result.error})
        }else{
            // create simple invoice
            await commonFunction.qpayValidateIPN(req,result,{qpay_payment_id:qpay_payment_id}).then(async resultInvoice => {
                if(resultInvoice.error){
                    return res.send({error:"Something went wrong, please try again later.",errorMessage:resultInvoice.error})
                }else{
                    if(resultInvoice.payment_status.toUpperCase() == "PAID"){
                        let currentDate = dateTime.create().format("Y-m-d H:M:S")
                        req.session.ad_user_id = order.owner_id
                        req.session.adsAmount = order.summary
                        req.session.orderId = order.order_id
                        let gatewayResponse = {}
                        console.log(req.session)
                        gatewayResponse.transaction_id = require('uniqid').process('wallet_user')
                        gatewayResponse.state = "completed".toLowerCase()  
                        // payment success
                        await globalModel.custom(req, "SELECT wallet FROM users WHERE user_id = ?", [req.session.ad_user_id]).then(async result => {
                            if (result) {
                                const walletData = parseFloat(JSON.parse(JSON.stringify(result))[0].wallet) + parseFloat(req.session.adsAmount);
                                await globalModel.update(req, { wallet: walletData }, "users", "user_id", req.session.ad_user_id).then(async result => {
                                    if (result) {
                                        await globalModel.create(req, {order_id:0,subscription_id:0,type:"wallet",id:req.session.ad_user_id,package_id:0,admin_commission:0, gateway_transaction_id: gatewayResponse.transaction_id, owner_id: req.session.ad_user_id, state: gatewayResponse.state, price: req.session.adsAmount, currency: req.appSettings.payment_default_currency, creation_date: currentDate, modified_date: currentDate }, "transactions").then(async result => {
                                            //update order table
                                            req.session.ad_user_id = null
                                            globalModel.update(req,{gateway_transaction_id:gatewayResponse.transaction_id,state:gatewayResponse.state,summary:""},"orders","order_id",req.session.orderId)                                            
                                            //update points
                                            notifications.insert(req, {owner_id:order.owner_id,insert:true, type: "wallet_recharge", subject_type: "users", subject_id: order.owner_id, object_type: "members", object_id: order.owner_id,forceInsert:true }).then(result => {
                
                                            }).catch(err => {
                                                console.log(err)
                                            })
                                                                                        
                                        })
                                        socketio.getIO().emit('qpayOrderComplete', {
                                            "order_id": order.order_id,
                                            "status": "success",
                                        });
                                        return res.send("OK")
                                    } else {
                                        socketio.getIO().emit('qpayOrderComplete', {
                                            "order_id": order.order_id,
                                            "status": "failed",
                                        });
                                        return res.send("FAILED")

                                    }
                                })
                            } else {
                                socketio.getIO().emit('qpayOrderComplete', {
                                    "order_id": order.order_id,
                                    "status": "failed",
                                });
                                return res.send("FAILED")
                            }
                        })
                    }else if(resultInvoice.payment_status.toUpperCase() == "FAILED"){
                        // payment failed
                        socketio.getIO().emit('qpayOrderComplete', {
                            "order_id": order.order_id,
                            "status": "failed",
                        });
                        return res.send("FAILED")
                    }
                } 
            })
            
        }
        
    })


}

exports.successul = async (req, res, next) => {
    let gateway = req.body.gateway
    let stripeToken = req.body.stripeToken
    let amount = req.body.price

    let currentDate = dateTime.create().format("Y-m-d H:M:S")

    if(gateway == "2" && stripeToken){
        if (!amount || isNaN(amount) || !req.user) {
            return res.send({error:"Invalid request"});
        }
        amount = parseFloat(amount).toFixed(2)
        req.session.ad_user_id = req.user.user_id
        req.session.adsAmount = amount
         //delete all user pending orders
        await globalModel.custom(req,"DELETE FROM orders WHERE owner_id = ? AND state = 'pending'",[req.user.user_id]).then(result => {
            
        })
        //create order
        await globalModel.create(req, {owner_id:req.user.user_id,gateway_id:2,state:"pending",creation_date:currentDate,source_type:"wallet_user",source_id:req.user.user_id}, "orders").then(result => {
            if (result) {
                req.session.orderId = result.insertId
            } else {

            }
        })
    }

    let gatewayResponse = {}
    let isValidResult = false
    if(gateway == "2" && stripeToken){
        
        const stripe = require('stripe')(req.appSettings['payment_stripe_client_secret']);
        await new Promise(function(resolve, reject){
            stripe.customers.create({
                source: stripeToken,
                email: req.user.email
            },function(err, customer) {
                if(err){
                    resolve()
                    res.send({ error: err.raw.message });
                }else{
                    stripe.charges.create({
                        amount: amount*100,
                        currency: req.appSettings['payment_default_currency'],
                        description: req.i18n.t(constant.general.WALLETRECHARGE),
                        customer: customer.id,
                        metadata: {
                            order_id: req.session.orderId,
                            user_id:req.user.user_id
                        }
                    },function(err, charge) {
                        if(err) {
                            resolve()
                            res.send({ error: err.raw.message });
                        }
                        else {
                            resolve()
                            gatewayResponse.state = "completed";
                            gatewayResponse.transaction_id = charge.id;
                            isValidResult = true;
                        }
                    })
                }
            });
        })
    }
    if(gateway == "1" || !gateway){
        if (!req.user || !req.session.adstokenUserPayment || !req.session.ad_user_id || !req.session.adsAmount || !req.session.orderId) {
            return res.redirect(302, '/dashboard/ads')
        } else {
            const PayerID = req.query.PayerID
            await oneTimePaypal.execute(req, res, PayerID, { price: parseFloat(req.session.adsAmount) }).then(async executeResult => {
                if (executeResult) {
                    gatewayResponse.transaction_id = executeResult.transaction_id
                    gatewayResponse.state = executeResult.state.toLowerCase()      
                    isValidResult = true       
                    
                } else {
                    req.session.adsPaymentStatus = "fail"
                    if(req.session.redirectURL){
                        res.redirect(req.session.redirectURL)
                    }else if(req.session.fromBalance){
                        res.redirect("/dashboard/balance");
                    }else{
                        res.redirect("/dashboard/ads")
                    }
                    res.end()
                }
            }).catch(err => {
                req.session.adsPaymentStatus = "fail"
                if(req.session.redirectURL){
                    res.redirect(req.session.redirectURL)
                }else if(req.session.fromBalance){
                    res.redirect("/dashboard/balance");
                }else{
                    res.redirect("/dashboard/ads")
                }
                res.end()
            })
        }
    }


    if(isValidResult){
        await globalModel.custom(req, "SELECT wallet FROM users WHERE user_id = ?", [req.session.ad_user_id]).then(async result => {
            if (result) {
                const walletData = parseFloat(JSON.parse(JSON.stringify(result))[0].wallet) + parseFloat(req.session.adsAmount);
                await globalModel.update(req, { wallet: walletData }, "users", "user_id", req.session.ad_user_id).then(async result => {
                    if (result) {
                        await globalModel.create(req, {order_id:0,subscription_id:0,type:"wallet",id:req.session.ad_user_id,package_id:0,admin_commission:0, gateway_transaction_id: gatewayResponse.transaction_id, owner_id: req.session.ad_user_id, state: gatewayResponse.state, price: req.session.adsAmount, currency: req.appSettings.payment_default_currency, creation_date: currentDate, modified_date: currentDate }, "transactions").then(async result => {
                            //update order table
                            req.session.ad_user_id = null
                            globalModel.update(req,{gateway_transaction_id:gatewayResponse.transaction_id,state:gatewayResponse.state},"orders","order_id",req.session.orderId)
                            
                            //update points
                            
                            notifications.insert(req, {owner_id:req.user.user_id,insert:true, type: "wallet_recharge", subject_type: "users", subject_id: req.user.user_id, object_type: "members", object_id: req.user.user_id,forceInsert:true }).then(result => {

                            }).catch(err => {
                                console.log(err)
                            })
                            
                            if(!gateway){
                                req.session.adsPaymentStatus = "success"
                                if(req.session.redirectURL){
                                    res.redirect(req.session.redirectURL)
                                }else if(req.session.fromBalance){
                                    res.redirect("/dashboard/balance");
                                }else{
                                    res.redirect("/dashboard/ads")
                                }
                            }else{
                                res.send({status:true})
                            }
                            res.end()
                        })
                    } else {
                        if(!gateway){
                            req.session.adsPaymentStatus = "fail"
                            if(req.session.redirectURL){
                                res.redirect(req.session.redirectURL)
                            }else if(req.session.fromBalance){
                                res.redirect("/dashboard/balance");
                            }else{
                                res.redirect("/dashboard/ads")
                            }
                        }else{
                            res.send({error:constant.general.DATABSE})
                        }
                        res.end()
                    }
                })
            } else {
                if(!gateway){
                    req.session.adsPaymentStatus = "fail"
                    if(req.session.redirectURL){
                        res.redirect(req.session.redirectURL)
                    }else if(req.session.fromBalance){
                        res.redirect("/dashboard/balance");
                    }else{
                        res.redirect("/dashboard/ads")
                    }
                }else{
                    res.send({error:constant.general.DATABSE})
                }
                res.end()
            }
        })
    }
}

exports.cancel = (req, res, next) => {
    if (!req.session.adstokenUserPayment) {
        if(req.session.fromBalance){
            res.redirect("/dashboard/balance");
        }else{
            res.redirect("/dashboard/ads")
        }
        if (req.session.paypalData) {
            req.session.paypalData = null
        }
        res.end()
    }
    req.session.ad_user_id = null
    req.session.adstokenUserPayment = null
    if (req.session.paypalData) {
        req.session.paypalData = null
    }
    req.session.adsPaymentStatus = "cancel"
    if(req.session.redirectURL){
        res.redirect(req.session.redirectURL)
    }else if(req.session.fromBalance){
        res.redirect("/dashboard/balance");
    }else{
        res.redirect("/dashboard/ads")
    }
    return res.end();
}

exports.create = async (req, res) => {
    let adType = "ads_create"
    let isValid = true
    const id = req.params.id
    if (id) {
        adType = "ads_edit"
        await adsModel.findById(id, req, res, true).then(async ad => {
            req.query.editItem = ad
            req.query.id = id
            await privacyModel.permission(req, 'member', 'editads', ad).then(result => {
                isValid = result
            }).catch(err => {
                isValid = false
            })
        }).catch(err => {
            isValid = false
        })
    }else{
        if(!req.appSettings['video_ffmpeg_path'] && req.user.level_id != 1){
            return res.send({ ...req.query , pagenotfound: 1 });
        }
    }
    await commonFunction.getGeneralInfo(req, res, adType)
    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }

    //get categories
    const categories = []
    await categoryModel.findAll(req, { type: "video" }).then(result => {
        result.forEach(function (doc, index) {
            if (doc.subcategory_id == 0 && doc.subsubcategory_id == 0) {
                const docObject = doc
                //2nd level
                let sub = []
                result.forEach(function (subcat, index) {
                    if (subcat.subcategory_id == doc.category_id) {
                        let subsub = []
                        result.forEach(function (subsubcat, index) {
                            if (subsubcat.subsubcategory_id == subcat.category_id) {
                                subsub.push(subsubcat)
                            }
                        });
                        if (subsub.length > 0) {
                            subcat["subsubcategories"] = subsub;
                        }
                        sub.push(subcat)
                    }
                });
                if (sub.length > 0) {
                    docObject["subcategories"] = sub;
                }
                categories.push(docObject);
            }
        })
    })
    if (categories.length > 0)
        req.query.adCategories = categories

    
    return res.send({...req.query,page_type:"create-ad"});
    
}