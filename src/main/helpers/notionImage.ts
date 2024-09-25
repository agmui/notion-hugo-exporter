import { error } from "../logger";

// Common function to check if the URL matches both 'amazonaws.com' and 's3'
const isAwsImageUrlCommon = (url: string): boolean => {
  // Regular expression to match URLs containing 'amazonaws.com'
  const regHost = new RegExp(/amazonaws\.com/, "i");
  // Regular expression to match URLs containing 's3'
  const regS3 = new RegExp(/s3\./, "i");

  // Check if the URL matches both 'amazonaws.com' and 's3'
  return regHost.test(url) && regS3.test(url);
};

// TODO: The processing should be able to be unified
export const isAwsImageUrl = (url: string): boolean => {
  const parser = new URL(url);
  return isAwsImageUrlCommon(parser.host);
};

export const isAwsImageUrlString = (url: string): boolean => {
  return isAwsImageUrlCommon(url);
};

export const getImageFilename = (url: string): string => {
  const parser = new URL(url);
  const re = new RegExp(/([^/]+\.(?:jpe?g|gif|png|webp|avif))/, "i");
  const result = parser.pathname.match(re);

  if (!result) {
    throw error(`Failed to extract the filename.
    This function should always get some filename. Make sure that is appropriat URL`);
  }

  return result[0];
};

export const getImageUID = (url: string): string => {
  const u = new URL(url);
  const pathname = u.pathname;
  const m = pathname.split("/");

  return m[2];
};

export const getImageFullName = (url: string): string => {
  const u = new URL(url);
  const pathname = u.pathname;
  const m = pathname.match(/\/(.+)/);
  if (!m) {
    return "";
  }

  const fullname = m[1];

  const notionPattern = new RegExp(
    /^.+notion-static.+\.(?:jpe?g|gif|png|webp|avif)/,
    "i"
  );

  const prodFilesPattern = new RegExp(
    /^.+prod-files-secure\.s3\.us-west-2\.amazonaws\.com\/(.+\.(?:jpe?g|gif|png|webp|avif))/,
    "i"
  );

  if (fullname.match(notionPattern)) {
    return fullname;
  } else if (url.match(prodFilesPattern)) {
    const match = url.match(prodFilesPattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return "";
};
