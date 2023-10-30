import React from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';

const MyImage = (props) => {
  // ToDo: isS3 set to false in code, instead, it should be taken from admin or environment variable.
  let isS3 = true;
  let isCloudFront = true;
  let url; // Declare the variable here

  if (props.image) {
    const splitVal = props.image.split('/');
    if (splitVal[0] !== 'http:' && splitVal[0] !== 'https:') {
      isCloudFront = true;
    }
    if (splitVal[0] == "http:" || splitVal[0] == "https:") {
      isS3 = false;
      isCloudFront = false;
    }
  }

  if (!props.image || props.image === "undefined") {
    return null;
  }

  let customProps = {};
  if (props.height) {
    customProps.height = props.height + "px";
  }  else {
    customProps.height = "640"; // if no props.height fail to default value
  }
  if (props.objectfit) {
    customProps.objectfit = props.objectfit;
  }
  if (props.layout) {
    customProps.layout = props.layout;
  }
  if (props.width) {
    customProps.width = props.width + "px";
  } else {
    customProps.width = "340"; // if no props.width fail to default value
  }

  if (Object.keys(customProps).length === 0) {
    customProps.layout = "fill";
  }

  let CloudFrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL_FOR_STATIC_RESOURCES;
  url = `${props.siteURL}/api/imagefetcher?url=${(
    (isS3 ? props.imageSuffix : "") + props.image
  )}`;

  if (isS3 && !isCloudFront) {
    url = `${props.siteURL}/api/imagefetcher?url=${isS3 ? props.imageSuffix : ''}${props.image}`;
  }

  if(isCloudFront){
    url = `${CloudFrontUrl}${props.image}`;
  }

  const myLoaderString = ({ src, width, quality }) => {
    if (quality) {
      return `${isCloudFront ? CloudFrontUrl : ''}${src}?format=auto&quality=${quality}&width=${customProps.width}`;
    } else {
      return `${isCloudFront ? CloudFrontUrl : ''}${src}?format=auto&width=${customProps.width}`;
    }
  }

  return (
    <LazyLoadImage
      alt={props.title}
      effect="blur"
      height={props.height || "640" }
      width={props.width || "340"}
      className={props.className ?? ''}
      src={`${url}?format=auto&width=${customProps.height}/${customProps.width}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      loader={myLoaderString({ // Call the function with an object as an argument
        src: url,
        width: customProps.width,
        quality: 80 // Pass the appropriate value for quality if needed
      })}
      layout={props.layout ?? 'responsive'}
      objectfit={props.objectfit ?? 'contain'}
      {...customProps}
    />
  );
};

export default MyImage;
