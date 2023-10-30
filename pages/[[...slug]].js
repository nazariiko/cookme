import React from "react";
import dynamic from "next/dynamic";
import axios from "../axios-main";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Layout from "../hoc/Layout/Layout";
import PageNotFound from "../containers/Error/PageNotFound";
import PermissionError from "../containers/Error/PermissionError";
import Login from "../containers/Login/Index";
import Maintanance from "../containers/Error/Maintenance";
// const i18n = require("../next-i18next.config")
// const i18nextHttpBackend = require('i18next-http-backend').default;

// // index
// import index from "../pagesData/index";
// import artist from "../pagesData/artist";
// import artists from "../pagesData/artists";
// import audio from "../pagesData/audio";
// import blog from "../pagesData/blog";
// import movies from "../pagesData/movies";
// import blogs from "../pagesData/blogs";
// import castandcrew from "../pagesData/cast-and-crew";
// import categories from "../pagesData/categories";
// import category from "../pagesData/category";
// import channel from "../pagesData/channel";
// import channels from "../pagesData/channels";
// import comment from "../pagesData/comment";
// import contact from "../pagesData/contact";
// import createad from "../pagesData/create-ad";
// import createaudio from "../pagesData/create-audio";
// import createblog from "../pagesData/create-blog";
// import createchannel from "../pagesData/create-channel";
// import createlivestreaming from "../pagesData/create-livestreaming";
// import createmovie from "../pagesData/create-movie";
// import createplaylist from "../pagesData/create-playlist";
// import createreel from "../pagesData/create-reel";
// import createseries from "../pagesData/create-series";
// import createvideo from "../pagesData/create-video";
// import dashboard from "../pagesData/dashboard";
// import embed from "../pagesData/embed";
// import forgotverify from "../pagesData/forgot-verify";
// import forgot from "../pagesData/forgot";
// import live from "../pagesData/live";
// import login from "../pagesData/login";
// import logout from "../pagesData/logout";
// import maintenance from "../pagesData/maintenance";
// import member from "../pagesData/member";
// import members from "../pagesData/members";
// import messanger from "../pagesData/messanger";
// import pagenotfound from "../pagesData/page-not-found";
// import pages from "../pagesData/pages";
// import paymentstate from "../pagesData/payment-state";
// import permissionerror from "../pagesData/permission-error";
// import playlist from "../pagesData/playlist";
// import playlists from "../pagesData/playlists";
// import post from "../pagesData/post";
// import privacy from "../pagesData/privacy";
// import reel from "../pagesData/reel";
// import reply from "../pagesData/reply";
// import search from "../pagesData/search";
// import season from "../pagesData/season";
// import series from "../pagesData/series";
// import story from "../pagesData/story";
// import signup from "../pagesData/signup";
// import terms from "../pagesData/terms";
// import upgrade from "../pagesData/upgrade";
// import verifyaccount from "../pagesData/verify-account";
// import videos from "../pagesData/videos";
// import watch from "../pagesData/watch";

const DynamicImport = (name) => dynamic(() => import(`../pagesData/${name}`),{
  ssr: false,
});
function Page(props) {
  let page_type = props.pageData.page_type ?? "index";
  if (props.pagenotfound) {
    page_type = "page-not-found";
  }
  // let components = {
  //   index: index,
  //   artist: artist,
  //   artists: artists,
  //   movies: movies,
  //   audio: audio,
  //   blog: blog,
  //   blogs: blogs,
  //   castandcrew: castandcrew,
  //   categories: categories,
  //   category: category,
  //   channel: channel,
  //   channels: channels,
  //   comment: comment,
  //   contact: contact,
  //   createad: createad,
  //   createaudio: createaudio,
  //   createblog: createblog,
  //   createchannel: createchannel,
  //   createlivestreaming: createlivestreaming,
  //   createmovie: createmovie,
  //   createplaylist: createplaylist,
  //   createreel: createreel,
  //   createseries: createseries,
  //   createvideo: createvideo,
  //   dashboard: dashboard,
  //   embed: embed,
  //   forgotverify: forgotverify,
  //   forgot: forgot,
  //   live: live,
  //   login: login,
  //   logout: logout,
  //   maintenance: maintenance,
  //   member: member,
  //   members: members,
  //   messanger: messanger,
  //   pagenotfound: pagenotfound,
  //   pages: pages,
  //   paymentstate: paymentstate,
  //   permissionerror: permissionerror,
  //   playlist: playlist,
  //   playlists: playlists,
  //   post: post,
  //   privacy: privacy,
  //   reel: reel,
  //   reply: reply,
  //   search: search,
  //   season: season,
  //   series: series,
  //   story: story,
  //   signup: signup,
  //   terms: terms,
  //   upgrade: upgrade,
  //   verifyaccount: verifyaccount,
  //   videos: videos,
  //   watch: watch,
  // };

  let Page = DynamicImport(page_type);
  // const Page = components[page_type.replace(/-/g, "")];
  let customParams = {};

  return (
    <Layout {...props} {...customParams}>
      <React.Fragment>
        {props.pagenotfound ? (
          <PageNotFound {...props} {...customParams} />
        ) : props.user_login ? (
          <Login {...props} {...customParams} />
        ) : props.permission_error ? (
          <PermissionError {...props} {...customParams} />
        ) : props.maintanance ? (
          <Maintanance {...props} />
        ) : (
          <Page {...props} {...customParams} />
        )}
      </React.Fragment>
    </Layout>
  );
}

/* If the intention is to cache the response, the fixed code could look like this */
/*
export async function getServerSideProps(context) {
  // cache response
  context.res?.setHeader(
    "cache-control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );
*/
/* If the intention is to disable caching, the fixed code could look like this: */

export async function getServerSideProps(context) {
  // disable caching
  context.res?.setHeader(
    "cache-control",
     'private, no-cache, no-store, must-revalidate'
   );

  let userAgent;
  userAgent = context.req?.headers["user-agent"];
  let isMobile = false;
  let IEBrowser = false;
  if (userAgent) {
    isMobile = Boolean(
      userAgent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      )
    );
    IEBrowser =
      context.req?.headers["user-agent"] &&
      (context.req?.headers["user-agent"].indexOf("MSIE") >= 0 ||
        context.req?.headers["user-agent"].indexOf("Trident") >= 0);
  }
  let subPath = "/";
  if (context.params.slug) {
    subPath = "/" + context.params.slug.join("/");
  }
  context.query.fromWebsite = true;
  if (context.query) {
    delete context.query.slug;
  }
  if (process.env.NODE_ENV !== "production")
    console.log("===== PATH: ", subPath, " ============= ", context.locale);

  const result = await axios
    .get(subPath, {
      params: {...context.query,siteLocale:context.locale},
      withCredentials: true,
      headers: {
        Cookie: context.req?.headers?.cookie ?? "",
      },
    })
    .catch((err) => {
      console.log("error axios");
    });
  let data = {...result.data};
  if (!data) data = {};
  if (data.error) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
  if (data.redirect) {
    return {
      redirect: {
        permanent: false,
        destination: data.url,
      },
    };
  }
  if (data.logout) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  data.IEBrowser = IEBrowser;
  data.isMobile = isMobile;
  let responseData = {
    pageData: data,
    initialLanguage: data.initialLanguage,
    ...(await serverSideTranslations(data.initialLanguage, "common")),
  };
  let page_type = data.page_type ?? "index";
  let customParams = {}
  if (
    page_type == "dashboard" ||
    page_type == "create-movie" ||
    page_type == "create-series" ||
    page_type == "embed" ||
    page_type == "search" ||
    page_type == "watch"
  )
    customParams.hideSmallMenu = true;

  if (page_type == "artist" || page_type == "cast-and-crew")
    customParams.artistView = true;

  if (page_type == "channel" || page_type == "channelView")
    customParams.channelView = true;

  if (page_type == "create-livestreaming") customParams.liveStreaming = true;

  if (page_type == "embed") {
    customParams.videoView = true;
    customParams.embedVideo = true;
  }
  if (page_type == "watch") {
    customParams.videoView = true;
  }
  if (page_type == "signup") {
    customParams.signButtonHide = true;
  }
  if (page_type == "forgot-verify" || page_type == "login") {
    customParams.loginButtonHide = true;
  }

  if (
    page_type == "forgot" ||
    page_type == "login" ||
    page_type == "signup" ||
    page_type == "verify-account"
  ) {
    customParams.redirectLogin = true;
  }
  if (page_type == "maintenance") {
    customParams.maintenance = true;
  }

  if (page_type == "messanger") {
    customParams.chatMessages = true;
  }
  data.custompageParams = customParams
  if (data.pagenotfound) responseData.pagenotfound = data.pagenotfound;
  if (data.user_login) responseData.user_login = data.user_login;
  if (data.permission_error)
    responseData.permission_error = data.permission_error;
  if (data.maintanance) responseData.maintanance = data.maintanance;

  // Pass data to the page via props
  return { props: responseData };
}

export default Page;
