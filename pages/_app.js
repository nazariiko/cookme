import React,{useReducer,useEffect} from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import OneSignal from 'react-onesignal';
import SendMessageToApps from "../components/SendMessageToApps/Index"
import axios from "../axios-main"
import { Provider } from "react-redux";
import { store } from "../store/index";
import { appWithTranslation } from 'next-i18next'
import config from "../config";
import socketOpen from "socket.io-client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-phone-number-input/style.css'
import PageComponent from '../hoc/Layout/PageComponent';
import Router from 'next/router';
import { datadogRum } from "@datadog/browser-rum";
const socket = socketOpen(config.actualPath,{path:`${config.basePath}socket.io`});

/* Implement @datadog/browser-rum */
/* Set default values if environment variables are not set */
if (process.env.NODE_ENV !== 'development') {
	const defaultValues = {
	  DATADOG_SITE: 'datadoghq.com',
	  DATADOG_SESSION_SAMPLE_RATE: 90,
	  DATADOG_SESSION_REPLAY_SAMPLE_RATE: 20,
	  DATADOG_TRACK_USER_INTERACTIONS: true,
	  DATADOG_TRACK_RESOURCES: true,
	  DATADOG_TRACK_LONG_TASKS: false,
	  DATADOG_DEFAULT_PRIVACY_LEVEL: 'mask-user-input',
	};

	const getValueOrDefault = (envVar, defaultValue) => {
	  return process.env[envVar] || defaultValue;
	};

	const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID;
	const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN;
	const site = getValueOrDefault('NEXT_PUBLIC_DATADOG_SITE', defaultValues.DATADOG_SITE);
	const service = "cookme";
	const env = process.env.NODE_ENV;
	const version = require('../package.json').version;
	const sessionSampleRate = getValueOrDefault('NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE', defaultValues.DATADOG_SESSION_SAMPLE_RATE);
	const sessionReplaySampleRate = getValueOrDefault('NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE', defaultValues.DATADOG_SESSION_REPLAY_SAMPLE_RATE);
	const trackUserInteractions = getValueOrDefault('NEXT_PUBLIC_DATADOG_TRACK_USER_INTERACTIONS', defaultValues.DATADOG_TRACK_USER_INTERACTIONS);
	const trackResources = getValueOrDefault('NEXT_PUBLIC_DATADOG_TRACK_RESOURCES', defaultValues.DATADOG_TRACK_RESOURCES);
	const trackLongTasks = getValueOrDefault('NEXT_PUBLIC_DATADOG_TRACK_LONG_TASKS', defaultValues.DATADOG_TRACK_LONG_TASKS);
	const defaultPrivacyLevel = getValueOrDefault('NEXT_PUBLIC_DATADOG_DEFAULT_PRIVACY_LEVEL', defaultValues.DATADOG_DEFAULT_PRIVACY_LEVEL);

	datadogRum.init({
	  applicationId,
	  clientToken,
	  site,
	  service,
	  env,
	  version,
	  sessionSampleRate,
	  sessionReplaySampleRate,
	  trackUserInteractions,
	  trackResources,
	  trackLongTasks,
	  defaultPrivacyLevel,
	});

	console.log("Datadog RUM initialized");
	datadogRum.startSessionReplayRecording();
  }
const MyApp = ({ Component, pageProps }) => {
	const [state, setState] = useReducer(
		(state, newState) => ({ ...state, ...newState }),
		{
			pageData:pageProps.pageData,
			levelPermissions:pageProps.pageData && pageProps.pageData.levelPermissions ? pageProps.pageData.levelPermissions : {} ,
			appSettings:pageProps.pageData && pageProps.pageData.appSettings ? pageProps.pageData.appSettings : {} ,
		}
	);
	if(!state.appSettings){
		return "error";
	}
	const updateUserToken = (userId) => {
		if(!userId || userId == ""){
			return;
		}
		let formData = new FormData();
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        };

		if(window.localStorage){
			let oldToken = window.localStorage.getItem("push-token")
			if(oldToken){
				formData.append("oldToken",oldToken);
			}
		}
		if(window.localStorage)
			window.localStorage.setItem("push-token", userId);

        let url = `/update-user-push-token`;
        formData.append('token', userId)
        axios.post(url, formData, config)
		.then(response => {


		}).catch(err => {

		});
	}
	useEffect(() => {
		if(typeof window != "undefined" &&  pageProps && pageProps.pageData && state.pageData && pageProps.pageData.loggedInUserDetails && state.pageData.loggedInUserDetails != pageProps.pageData.loggedInUserDetails){
			SendMessageToApps({props:pageProps,type:"loggedinUser"});
		}
		let updateValue = {}
		if(JSON.stringify(pageProps.pageData) != JSON.stringify(state.pageData)){
			updateValue.pageProps = pageData
		}
		if(pageProps.pageData && pageProps.pageData.appSettings && (JSON.stringify(pageProps.pageData.appSettings) != JSON.stringify(state.appSettings) || JSON.stringify(pageProps.pageData.levelPermissions) != JSON.stringify(state.levelPermissions))){
			updateValue.levelPermissions = pageProps.pageData && pageProps.pageData.levelPermissions ? pageProps.pageData.levelPermissions : {}
			updateValue.appSettings = pageProps.pageData && pageProps.pageData.appSettings ? pageProps.pageData.appSettings : {}
		}
		if(Object.keys(updateValue).length > 0){
			setState(updateValue)
		}

	},[pageProps])
	useEffect(()=>{

		if(pageProps.pageData && pageProps.pageData.fromAppDevice == "ios"){
			window.addEventListener('PTVNativeAppbridge', function(event) {
				const message = event.detail;
				if(message.type === 'login'){
					$('.loginRgtrBoxPopup').find('button').eq(0).trigger('click')
					if (!pageProps.pageData.loggedInUserDetails || pageProps.pageData.loggedInUserDetails.user_id != pageProps.pageData.loggedInUserDetails.user_id) {
						if(pageProps.pageData.loggedInUserDetails)
							socket.emit('chatJoin', {id:pageProps.pageData.loggedInUserDetails.user_id})
						let path = state.previousUrl ? state.previousUrl : Router.asPath
						if(path == "/login" || asPath == "/login" || path == "/signup" || asPath == "/signup"){
							Router.push('/');
						}else{
							Router.push(path).catch((err) => {
								window.location.href = path;
							})
						}
					}
				}
			})
		}

		// push notifications
		if(!pageProps.pageData.fromAPP && pageProps.pageData && pageProps.pageData.appSettings["enable_pushnotification"] == 1 && pageProps.pageData.appSettings["oneSignal_app_id"] != ""){
			OneSignal.init({
				appId: pageProps.pageData.appSettings["oneSignal_app_id"],
				allowLocalhostAsSecureOrigin: pageProps.pageData.environment == "dev",
				notifyButton: {
					enable: true,
				},
			}).then(() => {
				OneSignal.showSlidedownPrompt().then((res) => {
					OneSignal.getUserId().then(function(userId) {
						// update user token
						if (pageProps.pageData.loggedInUserDetails){
							updateUserToken(userId);
						}
					});
				// do other stuff
				});
			})
			OneSignal.on('subscriptionChange', function(isSubscribed) {
				if(isSubscribed){
					OneSignal.getUserId().then(function(userId) {
						// update user token
						if (pageProps.pageData.loggedInUserDetails){
							updateUserToken(userId);
						}
					});
				}else{
					// remove subscription
				}
			});
		}
		// if(pageProps.pageData.loggedInUserDetails){
			SendMessageToApps({props:pageProps,type:"loggedinUser",theme:pageProps.pageData.themeMode});
		// }
	},[])

		let pageData = <PageComponent {...pageProps} Component={Component} socket={socket} />
		{
			pageProps.pageData && pageProps.pageData.appSettings["recaptcha_enable"] == 1 ?
			pageData = 	<GoogleReCaptchaProvider
					useRecaptchaNet={false}
					// language={pageProps.i18n.language}
					useEnterprise={pageProps.pageData.appSettings["recaptcha_enterprise"] == 1 ? true : false}
					reCaptchaKey={pageProps.pageData.appSettings["recaptcha_key"]}
					scriptProps={{ async: true, defer: true, appendTo: 'head' }}
				>
					{pageData}
				</GoogleReCaptchaProvider>
			: null
		}
		return (
			pageProps.pageData && pageProps.pageData.appSettings["gid"] ?
				<GoogleOAuthProvider clientId={pageProps.pageData.appSettings["gid"]}>
					<Provider store={store}>{pageData}</Provider>
				</GoogleOAuthProvider>
			:
			<Provider store={store}>{pageData}</Provider>
		)
}
export default appWithTranslation(MyApp)
