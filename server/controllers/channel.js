const commonFunction = require("../functions/commonFunctions")
const settingModel = require("../models/settings")
const artistModel = require("../models/artists")
const categoryModel = require("../models/categories")
const channelModel = require("../models/channels")
const privacyModel = require("../models/privacy")
const userModel = require("../models/users")
const channelVideos = require("../models/channelvideos")
const channelPlaylists = require("../models/channelPlaylists")
const likeModel = require("../models/likes")
const favouriteModel = require("../models/favourites")
const followModel = require("../models/followers")
const ratingModel = require("../models/ratings")
const recentlyViewed = require("../models/recentlyViewed")
const dateTime = require("node-datetime")
const globalModel = require("../models/globalModel")
const privacyLevelModel = require("../models/levelPermissions")

exports.categories = async (req, res) => {
    await commonFunction.getGeneralInfo(req, res, 'browse_channel_category_view')
    req.query.type = "channel"
    let category = {}
    await categoryModel.findAll(req,{getCount:1, type: req.query.type,orderBy:" categories.item_count DESC "  }).then(result => {
        if (result)
            category = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    if (!Object.keys(category).length) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category = category
    await commonFunction.updateMetaData(req,{title:category.title,description:category.description,image:category.image})

    const limit = 10
    const data = { limit: limit,orderby:" view_count DESC" }

    await channelModel.getChannels(req, data).then(result => {
        if (result) {
            let items = result
            req.query.items = items
        }
    })
    return res.send({...req.query,page_type:"categories"});
    
}

exports.category = async (req, res) => {
    const url = req.params.id
    await commonFunction.getGeneralInfo(req, res, 'channel_category_view')
    
    req.query.id = req.params.id
    req.query.type = "channel"
    let category = {}
    await categoryModel.findByCustomUrl({ id: req.query.id, type: req.query.type}, req, res).then(result => {
        if (result)
            category = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    if (!Object.keys(category).length) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    req.query.category = category
    await commonFunction.updateMetaData(req,{title:category.title,description:category.description,image:category.image})

    if (category.subcategory_id == 0 && category.subsubcategory_id == 0) {
        await categoryModel.findAll(req, { type: "channel", subcategory_id: category.category_id, item_count: 1 }).then(result => {
            if (result) {
                req.query.subcategories = result
            }
        });
    } else if (category.subcategory_id > 0) {
        await categoryModel.findAll(req, { type: "channel", subsubcategory_id: category.category_id, item_count: 1 }).then(result => {
            if (result) {
                req.query.subsubcategories = result
            }
        });
    }
    const limit = 21
    const data = { limit: limit }
    if (category.subcategory_id == 0 && category.subsubcategory_id == 0) {
        data['category_id'] = category.category_id
    } else if (category.subcategory_id > 0) {
        data['subcategory_id'] = category.category_id
    } else if (category.subsubcategory_id > 0) {
        data['subsubcategory_id'] = category.category_id
    }


    //get all channels as per categories
    await channelModel.getChannels(req, data).then(result => {
        if (result) {
            req.query.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.items = items
        }
    })
    return res.send({...req.query,page_type:"category"});
    
}
exports.browse = async (req, res) => {
    const queryString = req.query
    await commonFunction.getGeneralInfo(req, res, 'channel_browse')
    
    const limit = 21
    const data = { limit: limit }
    req.query.search = {}
    data['type'] = queryString.type
    if (queryString.q && !queryString.tag) {
        req.query.search.q = queryString.q
        data['title'] = queryString.q
    }
    if (queryString.tag) {
        req.query.search.tag = queryString.tag
        req.query.search.q = queryString.tag
        data['tags'] = queryString.tag
    }
    if (queryString.category_id) {
        data['category_id'] = queryString.category_id
        req.query.search.category_id = queryString.category_id
    }
    if (queryString.subcategory_id) {
        data['subcategory_id'] = queryString.subcategory_id
        queryString.category_id = queryString.subcategory_id
        req.query.search.subcategory_id = queryString.subcategory_id
    }
    if (queryString.subsubcategory_id) {
        data['subsubcategory_id'] = queryString.subsubcategory_id
        queryString.category_id = queryString.subsubcategory_id
        req.query.search.subsubcategory_id = queryString.subsubcategory_id
    }

    if (queryString.sort == "latest") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "channels.channel_id desc"
    } else if (queryString.sort == "favourite" && req.appSettings['channel_favourite'] == 1) {
        req.query.search.sort = queryString.sort
        data['orderby'] = "channels.favourite_count desc"
    } else if (queryString.sort == "view") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "channels.view_count desc"
    } else if (queryString.sort == "like" && req.appSettings['channel_like'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "channels.like_count desc"
    } else if (queryString.sort == "dislike" && req.appSettings['channel_dislike'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "channels.dislike_count desc"
    } else if (queryString.sort == "rated" && req.appSettings['channel_rating'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "channels.rating desc"
    } else if (queryString.sort == "commented" && req.appSettings['channel_comment'] == "1") {
        req.query.search.sort = queryString.sort
        data['orderby'] = "channels.comment_count desc"
    }

    if (queryString.type == "featured" && req.appSettings['channel_featured'] == 1) {
        req.query.search.type = queryString.type
        data['is_featured'] = 1
    } else if (queryString.type == "sponsored" && req.appSettings['channel_sponsored'] == 1) {
        req.query.search.type = queryString.type
        data['is_sponsored'] = 1
    } else if (queryString.type == "hot" && req.appSettings['channel_hot'] == 1) {
        req.query.search.type = queryString.type
        data['is_hot'] = 1
    }

    //get all channels as per categories
    await channelModel.getChannels(req, data).then(result => {
        if (result) {
            req.query.pagging = false
            let items = result
            if (result.length > limit - 1) {
                items = result.splice(0, limit - 1);
                req.query.pagging = true
            }
            req.query.channels = items
        }
    })
    //get categories
    const categories = []
    await categoryModel.findAll(req, { type: "channel" }).then(result => {
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
        req.query.categories = categories

    return res.send({...req.query,page_type:"channels"});
    
}

exports.post = async(req,res,next) => {
    await commonFunction.getGeneralInfo(req, res, 'channel_post_view')
    req.query.id = req.params.id
    let post = {}
    await channelModel.findAllCommunity(0, req, res,1,0,req.query.id).then(result => {
        if (result && result.length > 0)
            post = result[0]
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })
    
    let showPost = true
    let channel = {}
    if (Object.keys(post).length) {

        await channelModel.findById(post.channel_id, req).then(result => {
            if (result)
                channel = result
        }).catch(error => {
            return res.send({ ...req.query , pagenotfound: 1 });
        })

        await privacyModel.check(req, channel, 'channel').then(result => {
            showPost = result
            if (!showPost) {
                return res.send({...req.query,permission_error:1});
            }
        }).catch(error => {
            showPost = false
        })
    }else{
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    
    if (!showPost){
        return res.send({...req.query,permission_error:1});
    }

    await privacyModel.permission(req, 'channel', 'delete', channel).then(result => {
        post.canDelete = result
    })
    await privacyModel.permission(req, 'channel', 'edit', channel).then(result => {
        post.canEdit = result
    })
    
    if (!Object.keys(channel).length || (channel.approve != 1 && (!req.user || channel.owner_id != req.user.user_id && req.levelPermissions['channel.view'] != 2 ))) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    await commonFunction.updateMetaData(req,{description:post.description,image:post.image})

    if (req.user) {
        await likeModel.isLiked(post.post_id, 'channel_posts', req, res).then(result => {
            if (result) {
                post.like_dislike = result.like_dislike
            }
        })
    }
    recentlyViewed.insert(req, { id: post.post_id, owner_id: post.owner_id, type: 'channel_posts', creation_date: dateTime.create().format("Y-m-d H:M:S") })
    req.query.channel = channel
    req.query.post = post
    return res.send({...req.query,page_type:"post"});
   
}

exports.view = async (req, res) => {

    await commonFunction.getGeneralInfo(req, res, 'channel_view')
    req.query.tabType = (req.query.type ? req.query.type : "videos")
    req.query.id = req.params.id

    let channel = {}

    await channelModel.findByCustomUrl(req.query.id, req, res).then(result => {
        if (result)
            channel = result
    }).catch(error => {
        return res.send({ ...req.query , pagenotfound: 1 });
    })

    let showChannel = true
    if (Object.keys(channel).length) {
        await privacyModel.check(req, channel, 'channel').then(result => {
            showChannel = result
        }).catch(error => {
            showChannel = false
        })
    }else{
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    if (!showChannel){
        return res.send({...req.query,permission_error:1});
    }
    await privacyModel.permission(req, 'channel', 'delete', channel).then(result => {
        channel.canDelete = result
    })
    await privacyModel.permission(req, 'channel', 'edit', channel).then(result => {
        channel.canEdit = result
    })
    
    if (!Object.keys(channel).length || (channel.approve != 1 && (!req.user || channel.owner_id != req.user.user_id && req.levelPermissions['channel.view'] != 2 ))) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    await commonFunction.updateMetaData(req,{title:channel.title,description:channel.description,image:channel.image,keywords:channel.tags})

    //channel user details
    await userModel.findById(channel.owner_id, req, res).then(result => {
        channel.owner = result
    }).catch(error => {

    })
    //owner plans
    await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',channel.owner.level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1){
        let isPermissionAllowed = false
        if(req.user && (req.user.user_id == channel.owner_id || (req.levelPermissions["channels.view"] && req.levelPermissions["channels.view"].toString() == "2"))){
            isPermissionAllowed = true;
        }
        if(channel.view_privacy.indexOf("package_") > -1 && !isPermissionAllowed){
            let owner_id = req.user ? req.user.user_id : 0
            let checkPlanSql = ""
            let conditionPlanSql = [owner_id,channel.channel_id]
            checkPlanSql += 'SELECT `member_plans`.price as `package_price`,`subscriptions`.package_id as loggedin_package_id,mp.price as loggedin_price,'
            checkPlanSql+=  ' CASE WHEN member_plans.price IS NULL THEN 1 WHEN mp.price IS NULL THEN 0 WHEN  `member_plans`.price <= mp.price THEN 1'
            checkPlanSql+=  ' WHEN  `member_plans`.price > mp.price THEN 2'
            checkPlanSql += ' ELSE 0 END as is_active_package'
            checkPlanSql += ' FROM `channels` LEFT JOIN `member_plans` ON `member_plans`.member_plan_id = REPLACE(`channels`.view_privacy,"package_","") LEFT JOIN'
            checkPlanSql += ' `subscriptions` ON subscriptions.id = channels.owner_id AND subscriptions.owner_id = ? AND subscriptions.type = "user_subscribe" AND subscriptions.status IN ("active","completed") LEFT JOIN `member_plans` as mp ON mp.member_plan_id = `subscriptions`.package_id WHERE '
            checkPlanSql += ' channels.channel_id = ? LIMIT 1'
            await globalModel.custom(req,checkPlanSql,conditionPlanSql).then(result => {
                if(result && result.length > 0){
                    const res = JSON.parse(JSON.stringify(result))[0];
                    if(res.is_active_package == 0){
                        res.type = "new"
                        req.query.needSubscription = res; 
                    }else if(res.is_active_package == 2){
                        res.type = "upgrade"
                        req.query.needSubscription = res;
                    }
                }
            })
        }
    }

    if(req.query.needSubscription){
        if(req.query.tabType == "videos"){
            req.query.tabType = "plans"
        }
        //get user plans
        await userModel.getPlans(req, { owner_id: channel.owner.user_id, item:req.query.needSubscription }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }else{
        if(req.query.tabType == "plans"){
            req.query.tabType = "videos"
        }
    }
    
    if(!req.query.needSubscription){
        //channel videos
        let LimitNum = 21;
        let page = 1
        let offset = (page - 1) * LimitNum
        channel.videos = {
            pagging: false,
            result: []
        }
        await channelVideos.findAll(channel.channel_id, req, res, LimitNum, offset).then(result => {
            let pagging = false
            if (result) {
                pagging = false
                if (result.length > LimitNum - 1) {
                    result = result.splice(0, LimitNum - 1);
                    pagging = true
                }
                channel.videos = {
                    'pagging': pagging,
                    results: result
                }
            }
        })

        if (req.appSettings["enable_playlist"] == 1) {
            channel.playlists = {
                pagging: false,
                result: [] 
            }
            //channel playlists
            let LimitNumPlaylist = 13;
            let pagePlaylist = 1
            let offsetPlaylist = (pagePlaylist - 1) * LimitNumPlaylist
            await channelPlaylists.findAll(channel.channel_id, req, res, LimitNumPlaylist, offsetPlaylist).then(result => {
                let pagging = false
                if (result) {
                    pagging = false
                    if (result.length > LimitNumPlaylist - 1) {
                        result = result.splice(0, LimitNumPlaylist - 1);
                        pagging = true
                    }
                    channel.playlists = {
                        'pagging': pagging,
                        results: result
                    }
                }
            })
        }

        channel.posts = {
            pagging: false,
            result: []
        }
        //channel posts
        let LimitNumCommunity = 11;
        let pageCommunity = 1
        let offsetCommunity = (pageCommunity - 1) * LimitNumCommunity
        await channelModel.findAllCommunity(channel.channel_id, req, res, LimitNumCommunity, offsetCommunity).then(result => {
            let pagging = false
            if (result) {
                pagging = false
                if (result.length > LimitNumCommunity - 1) {
                    result = result.splice(0, LimitNumCommunity - 1);
                    pagging = true
                }
                channel.posts = {
                    'pagging': pagging,
                    results: result
                }
            }
        })

        //fetch artists
        let LimitNumArtist = 17;
        let pageArtist = 1
        let offsetArtist = (pageArtist - 1) * LimitNumArtist
        if (channel.artists && channel.artist != "" && req.appSettings['channel_artists'] == "1") {
            await artistModel.findByIds(channel.artists, req, res, LimitNumArtist, offsetArtist).then(result => {
                let pagging = false
                if (result) {
                    pagging = false
                    if (result.length > LimitNumArtist - 1) {
                        result = result.splice(0, LimitNumArtist - 1);
                        pagging = true
                    }
                    channel.artists = {
                        'pagging': pagging,
                        results: result
                    }
                }
            }).catch(error => {
                console.log(error)
            })
        } else {
            channel.artists = {
                'pagging': false,
                results: []
            }
        }

        //check support button enable
        if(req.user && parseInt(req.appSettings['channel_support'])  == 1 && parseFloat(channel.channel_subscription_amount) > 0 ) {
            const condition = []
            let sql = 'SELECT expiration_date FROM subscriptions where 1 = 1'
            condition.push(parseInt(req.user.user_id))
            sql += " and owner_id = ?"
            condition.push("channel_subscription")
            sql += " and type = ?"
            condition.push(channel.channel_id)
            sql += " and id = ?"
            var dt = dateTime.create();
            var formatted = dt.format('Y-m-d H:M:S');
            condition.push(formatted)
            sql += " and (expiration_date IS NULL || expiration_date >= ?)"
            sql += " and (status = 'completed' || status = 'approved' || status = 'active') "
            condition.push(1)
            sql += " LIMIT ?"
            await globalModel.custom(req,sql,condition).then(result => {
                if(result && result.length > 0){
                    req.query.userSupportChannel = true
                }
            })

            //get channel supports
            let LimitNum = 21;
            let page = 1
            let offsetArtist = (page - 1) * LimitNum
            await channelModel.getChannelSupporters(req,{channel_id:channel.channel_id, limit: LimitNum, offset:offsetArtist}).then(result => {
                let pagging = false
                if (result) {
                    pagging = false
                    if (result.length > LimitNum - 1) {
                        result = result.splice(0, LimitNum - 1);
                        pagging = true
                    }
                    channel.supporters = {
                        'pagging': pagging,
                        results: result
                    }
                }
            }).catch(error => {
                console.log(error)
            })

        }
    }
    if (req.user) {
        await likeModel.isLiked(channel.channel_id, 'channels', req, res).then(result => {
            if (result) {
                channel.like_dislike = result.like_dislike
            }
        })
        await followModel.isFollowed(req, 'channels', req.user.user_id, channel.channel_id).then(result => {
            if (result) {
                channel.follower_id = result.follower_id
            }
        })
        //favourite
        await favouriteModel.isFavourite(channel.channel_id, 'channels', req, res).then(result => {
            if (result) {
                channel['favourite_id'] = result.favourite_id
            }
        })
        //ratings
        channel['ratings'] = 0
        await ratingModel.isRated(channel.channel_id, 'channels', req, res).then(result => {
            if (result) {
                channel['ratings'] = result.rating
            }
        })
    }

    
    //category details
    if (channel.category_id) {
        await categoryModel.findById(channel.category_id, req, res).then(result => {
            if (result) {
                channel.category = result
            }
        })
        if (channel.subcategory_id) {
            await categoryModel.findById(channel.subcategory_id, req, res).then(result => {
                if (result) {
                    channel.subcategory = result
                }
            })
            if (channel.subsubcategory_id) {
                await categoryModel.findById(channel.subsubcategory_id, req, res).then(result => {
                    if (result) {
                        channel.subsubcategory = result
                    }
                })
            }
        }
    }

    if (!req.query.password && (req.appSettings['channel_adult'] != 1 || (channel.adult == 0 || (channel.adult == 1 && req.query.adultAllowed)))) {
        req.query.channel = channel
        delete req.query.channel.password
        if(channel.approve == 1)
        recentlyViewed.insert(req, { id: channel.channel_id, owner_id: channel.owner_id, type: 'channels', creation_date: dateTime.create().format("Y-m-d H:M:S") })
    }else{
        req.query.adultChannel = channel.adult
    }
    await channelModel.getChannels(req, { category_id: channel.category_id, tags: channel.tags, not_channel_id: channel.channel_id, 'related': true, limit: 12 }).then(result => {
        if (result) {
            req.query.relatedChannels = result
        }
    })
   
    
    if (req.session.channelPaymentStatus) {
        req.query.channelPaymentStatus = req.session.channelPaymentStatus
        req.session.channelPaymentStatus = null
    }
    return res.send({...req.query,page_type:"channel"});
    
}
exports.create = async (req, res) => {
    let channelType = "channel_create"

    let isValid = true
    const id = req.params.id
    if (id) {
        channelType = "channel_edit"
        await channelModel.findByCustomUrl(id, req, res,true).then(async channel => {
            req.query.editItem = channel
            req.query.id = id
            await privacyModel.permission(req, 'channel', 'edit', channel).then(result => {
                isValid = result
            }).catch(err => {
                isValid = false
            })
        }).catch(err => {
            isValid = false
        })
    }
    await commonFunction.getGeneralInfo(req, res, channelType)
    if (!isValid) {
        return res.send({ ...req.query , pagenotfound: 1 });
    }
    
    //owner plans
    await privacyLevelModel.findBykey(req,"member",'allow_create_subscriptionplans',req.user.level_id).then(result => {
        req.query.planCreate = result  == 1 ? 1 : 0
    })
    if(req.query.planCreate == 1){
        //get user plans
        await userModel.getPlans(req, { owner_id: req.user.user_id }).then(result => {
            if (result) {
                req.query.plans = result
            }
        })
    }

    //get categories
    const categories = []
    await categoryModel.findAll(req, { type: "channel" }).then(result => {
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
        req.query.channelCategories = categories
    //get artists
    if (settingModel.getSetting(req, "channel_artists", 1) != 0) {
        await artistModel.findAll(req, { type: "channel" }).then(artist => {
            if (artist)
                req.query.channelArtists = artist;
        })
    }
    return res.send({...req.query,page_type:"create-channel"});
   
}