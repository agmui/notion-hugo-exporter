import { findByImageId } from "../datastore/imageMap";
import { publicPath } from "./asset";
import { getImageFullName, isAwsImageUrlString } from "./notionImage";

// If the input value is an S3 URL, find and replace the real file from the key.
// If the image tag does not match or there is no image cache, do nothing and return the input value.
const replaceS3ImageUrl = async (text: string): Promise<string> => {
  const originalLine = text;

  // Pattern to match markdown image tags with S3 URLs
  // expected for: ![](https://s3...)
  //             : ![any title](https://s3...)
  const markdownImageTagUrlPattern = new RegExp(
    /!\[.*\]\((https:\/\/(?:s3|prod-files-secure\.s3)\.[^)].+?)\)/
  );
  const match = text.match(markdownImageTagUrlPattern);

  if (match && match[1]) {
    const s3Url = match[1];

    // Extract the image ID from the S3 URL
    const imageId = getImageFullName(s3Url);
    const fileCache = await findByImageId(imageId);

    // If no cache is found, return the original line
    if (!fileCache) return originalLine;

    // Get the public file path from the cache
    const publicFilepath = publicPath(fileCache);

    // Replace the S3 URL with the public file path
    const newLine = originalLine.replace(s3Url, publicFilepath);

    return newLine;
  }

  // Return the original line if no match is found
  return originalLine;
};

export const convertS3ImageUrl = async (markdown: string): Promise<string> => {
  const new_md_array = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    if (isAwsImageUrlString(line)) {
      new_md_array.push(await replaceS3ImageUrl(line));
    } else {
      new_md_array.push(line);
    }
  }
  return new_md_array.join("\n");
};
