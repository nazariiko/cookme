import React from 'react'
import Menu from "../Menu/Index"
import FixedMenu from "../Menu/Fixed"
import Link from "../../components/Link"


export default function Index(props) {
    // Check if Cloudfront URL defined and use it, else use the original URL
    let CloudFrontUrl = process.env.CLOUDFRONT_URL_FOR_STATIC_RESOURCES;
    let ImageUrl;

    if (!CloudFrontUrl) {
        ImageUrl = props.pageData['imageSuffix'];
    } else {
        ImageUrl = CloudFrontUrl;
    }
    let logo = '';
    if (props.pageData.themeMode == 'dark') {
        logo =
        ImageUrl +
        props.pageData.appSettings['darktheme_logo'] +
        '?format=auto&width=640/340';
    } else {
        logo =
        ImageUrl +
        props.pageData.appSettings['lighttheme_logo'] +
        '?format=auto&width=640/340';
    }
    return (
        props.liveStreaming ?
            <div className="ls_HeaderWrap">
                <div className="container-fluid">
                    <div className="ls_headerContent">
                        <div className="logo" >
                            <Link href="/">
                                <a>
                                    <img src={logo} alt="AI Cooking"/>
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        :
        props.layout !="mobile" ?
            props.pageData.appSettings["fixed_header"] == 1 ?
                <FixedMenu {...props} />
            :
                <Menu {...props} />
        :
            <Menu {...props} mobileMenu={true} />
    )
}
