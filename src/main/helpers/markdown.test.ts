import { saveImageMap } from "./donwload";
import { convertS3ImageUrl } from "./markdown";

// Sample AWS S3 URLs for testing
const awsUrlPattern_1 =
  "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/abcdefgh-1234-5678-abcd-123456789012/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=CREDENTIALCREDENTIALCREDENTIAL0%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220101T000000Z&X-Amz-Expires=3600&X-Amz-Signature=signaturedummyasignaturedummyasignaturedummyasignaturedummyadef3&X-Amz-SignedHeaders=host&x-id=GetObject";

const awsUrlPattern_2 =
  "https://prod-files-secure.s3.us-west-2.amazonaws.com/01010101-0101-4070-0101-478b36d11111/01010101-0101-0101-0101-101010101010/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT7";

// Save image mappings before running tests
beforeAll(async () => {
  await saveImageMap(
    awsUrlPattern_1,
    "static/pimages/page-object-id/abcdefgh-1234-5678-abcd-123456789012-Untitled.png"
  );
  await saveImageMap(
    awsUrlPattern_2,
    "static/pimages/page-object-id/01010101-0101-4070-0101-478b36d11111-01010101-0101-0101-0101-101010101010-Untitled.png"
  );
});

describe("convertS3ImageUrl", () => {
  test("Matches the AWS url", async () => {
    // Markdown content with the first AWS S3 URL
    const md_one = `
# Hello notion with s3 image

![](${awsUrlPattern_1})

![Image Title](${awsUrlPattern_1})

end of md
`;

    // Expected markdown content after URL conversion
    const md_one_expected = `
# Hello notion with s3 image

![](/pimages/page-object-id/abcdefgh-1234-5678-abcd-123456789012-Untitled.png)

![Image Title](/pimages/page-object-id/abcdefgh-1234-5678-abcd-123456789012-Untitled.png)

end of md
`;

    // Convert S3 URLs in the markdown content
    const result = await convertS3ImageUrl(md_one);
    // Check if the result matches the expected content
    expect(result).toBe(md_one_expected);
  });

  test("Matches the new AWS url pattern", async () => {
    // Markdown content with the second AWS S3 URL
    const md_two = `
# Test with new S3 image

![](${awsUrlPattern_2})

end of md
`;

    // Expected markdown content after URL conversion
    const md_two_expected = `
# Test with new S3 image

![](/pimages/page-object-id/01010101-0101-4070-0101-478b36d11111-01010101-0101-0101-0101-101010101010-Untitled.png)

end of md
`;

    // Convert S3 URLs in the markdown content
    const result = await convertS3ImageUrl(md_two);
    // Check if the result matches the expected content
    expect(result).toBe(md_two_expected);
  });
});
