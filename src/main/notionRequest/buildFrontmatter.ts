import { getArticle } from "./pageClient";
import { isOnlyDate, setTimeMidnight } from "../helpers/date";
import { log, LogTypes } from "../logger";
import {
  pageTitle,
  pageAuthor,
  pageDraft,
  pagePublishedAt,
  pageUpdatedAt,
  pageTags,
  pageCategory,
  pageSection,
  pageSlug,
  pageUrl,
  pageDescription,
  pageFilepath,
  pageLinkTitle,
  pageWeight,
  extractExternalUrl,
  hasPlainText,
  getCustomProperty,
} from "./property";

// Store all metadata in frontMatter
// Values that are not directly needed to create Hugo pages are stored in the
// under 'sys' key (e.g. pageId, Page modification date, etc...)
// Note that: Notion's Page modification date (as 'last_edited_time') is different
//            from the last update date of Hugo's page ('lastmod')
export const getPageFrontmatter = async (
  pageMeta: any, // pageId: string,
  options: frontmatterOptions,
  customProperties: string[][] | undefined
): Promise<frontMatter> => {
  const pageId: string = pageMeta["id"];
  // const pageMeta = await getArticle(pageId);

  //@ts-ignore
  if (pageMeta["archive"]) {
    log(pageMeta);
    throw new Error(
      `The page property is "archive", but the status is "isPublished".
      Make sure the publishing settings for this article are correct.`
    );
  }
  //@ts-ignore
  const properties = pageMeta["properties"];
  log(
    `[Info] [name: ${pageTitle(
      properties
    )}, pageId: ${pageId}] Fetch from Notion API`
  );

  log(properties, LogTypes.debug);

  const date = pageMeta["last_edited_time"]; //pagePublishedAt(properties);
  const dateWithZone = isOnlyDate(date)
    ? setTimeMidnight(date, options.utcOffset)
    : date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const frontMatter: any = {
    sys: {
      pageId: pageId,
      //@ts-ignore
      createdTime: pageMeta["created_time"],
      //@ts-ignore
      lastEditedTime: pageMeta["last_edited_time"],
    },
    title: pageTitle(properties),
    date: dateWithZone,
    description: pageDescription(properties),
    tags: pageTags(properties),
    // categories: pageCategory(properties),
    author: pageAuthor(properties, options),
    draft: pageDraft(properties),
  };

  /*
  if (hasPlainText(properties["Url"])) {
    frontMatter["url"] = pageUrl(properties);
  } else if (hasPlainText(properties["Slug"])) {
    frontMatter["slug"] = pageSlug(properties);
  } else {
    throw new Error(
      `One of the "Url" and "Slug" page properties must be defined.`
    );
  }
  */

  // Property for forcing the exported `.md` file name.
  if (pageFilepath(properties)) {
    frontMatter["sys"]["propFilepath"] = pageFilepath(properties);
  }

  if (pageSection(properties)) {
    frontMatter["section"] = pageSection(properties);
  }

  if (pageUpdatedAt(properties)) {
    const lastmod: any = pageUpdatedAt(properties);
    frontMatter["lastmod"] = isOnlyDate(lastmod)
      ? setTimeMidnight(lastmod, options.utcOffset)
      : lastmod;
  }

  if (extractExternalUrl(properties)) {
    frontMatter["featured_image"] = extractExternalUrl(properties);
    frontMatter["images"] = [extractExternalUrl(properties)];
  }

  // Properties expected to be used by Docsy theme, etc
  //   linkTitle:
  //   weight:
  if (pageLinkTitle(properties)) {
    frontMatter["linkTitle"] = pageLinkTitle(properties);
  }

  if (pageWeight(properties)) {
    frontMatter["weight"] = pageWeight(properties);
  }

  if (customProperties) {
    for (const customProperty of customProperties) {
      const cProp = customProperty[0];
      const cType = customProperty[1];
      frontMatter[cProp] = getCustomProperty(properties, cProp, cType);
    }
  }

  return frontMatter as frontMatter;
};
