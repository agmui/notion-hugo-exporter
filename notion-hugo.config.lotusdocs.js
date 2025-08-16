const customTransformerCallback = (n2m) => {
  let code_transform = async (block) => {
    n2m.setCustomTransformer("code", async (block) => {
      return false;
    });

    //TODO: get prism <mark> tag to work
    if (block["code"].language == "c++") block["code"].language = "cpp";

    let res = await n2m.blockToMarkdown(block);
    let lines_to_highlight = " ";
    let lineno = 1;
    for (let s of block.code.rich_text) {
      let len = s.plain_text.split(/\n/).length - 1;
      if (s.annotations.color !== "default") {
        lines_to_highlight += `"${lineno}-${lineno + len}",`;
      }
      lineno += len;
    }
    if (lines_to_highlight !== "")
      lines_to_highlight = lines_to_highlight.slice(0, -1);

    let code_fence = res.indexOf("\n");
    n2m.setCustomTransformer("code", code_transform);
    return (
      res.slice(0, code_fence) + lines_to_highlight + res.slice(code_fence)
    );
  };
  n2m.setCustomTransformer("code", code_transform);

  n2m.setCustomTransformer("column_list", async (block) => {
    const mdBlocks_temp = await n2m.pageToMarkdown(block.id);
    let final_md_string = `<div style="display: flex;flex-direction: row; column-gap:10px; justify-content: left;">`;

    for (const one_block of mdBlocks_temp) {
      const mdString_temp = n2m.toMarkdownString(one_block.children).parent;
      final_md_string = final_md_string + `\n<div>\n${mdString_temp}\n</div>`;
    }

    return final_md_string + "\n</div>";
  });

  const toggle_transform = async (block) => {
    n2m.setCustomTransformer("toggle", async (block) => {
      return false;
    });
    const title = await n2m.blockToMarkdown(block);
    const child = await n2m.pageToMarkdown(block.id);

    n2m.setCustomTransformer("toggle", toggle_transform);
    return `<details>
  <summary>{{< markdownify >}}${title}{{< /markdownify >}}</summary>
  ${n2m.toMarkdownString(child).parent}
</details>\n\n`;
  };
  n2m.setCustomTransformer("toggle", toggle_transform);

  let table_transform = async (block) => {
    // This is a hack
    n2m.setCustomTransformer("table", async (block) => {
      return false;
    });
    const original_output = await n2m.blockToMarkdown(block);
    let mdString =
      '{{< table "table-striped table-hover table-responsive" >}}\n';
    mdString += `\n${original_output}\n`;
    mdString += "\n{{< /table >}}\n";

    n2m.setCustomTransformer("table", async (block) => table_transform);
    return mdString;
  };
  n2m.setCustomTransformer("table", table_transform);

  /* image dim is not exposed though notion api yet
  letimage_transform = async (block) => {
    n2m.setCustomTransformer("image", async (block) => {
      return false;
    });
    console.log(block);
    const original_output = await n2m.blockToMarkdown(block);
    const res = original_output.split(/!\[(.*)\]\((.*)\)/g);

    n2m.setCustomTransformer("image", image_transform);
    return false;
  }
  n2m.setCustomTransformer("image", image_transform);
  */

  // Example 1: Convert Bookmark block to Hugo format shortcode: {{<blogcard "https://notion.so/">}}
  n2m.setCustomTransformer("bookmark", async (block) => {
    const { bookmark } = block;
    if (!bookmark?.url) return "";
    return `{{<blogcard "${bookmark.url}">}}`;
  });

  // Example 2: Convert YouTube URL to Hugo format shortcode: {{<youtube "abcdefg">}}
  n2m.setCustomTransformer("video", async (block) => {
    const { video } = block;
    if (video.type !== "external") return "";

    const youtoube = new RegExp(/youtube.com/);
    if (youtoube.test(video.external.url)) {
      const url = new URL(video.external.url);
      const video_id = url.searchParams.get("v");
      return `{{<youtube "${video_id}">}}`;
    }
    return `Video URL: ${video.external.url}`;
  });
};

module.exports = {
  directory: "../../notion2hugo_test/content",
  //"content_notion",
  concurrency: 5, // TODO: try greater than 1

  // saveAwsImageDirectory: null,
  saveAwsImageDirectory: "tmp/downloads",

  s3ImageUrlWarningEnabled: true,

  // s3ImageUrlReplaceEnabled: true,

  // s3ImageConvertToWebpEnalbed: true,

  downloadImageCallback: null,

  customTransformerCallback: customTransformerCallback,

  authorName: "Overridden author",

  //chooses between base class and class in src/main/notion-to-md/notion-to-md.ts
  useOriginalConverter: false,

  // [Optional] setting, If you need.
  customProperties: [
    ["toc", "boolean"],
    ["icon", "text"],
  ],
};
