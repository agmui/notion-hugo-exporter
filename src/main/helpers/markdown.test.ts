import { saveImageMap } from "./donwload";
import { convertS3ImageUrl } from "./markdown";

beforeAll(async () => {
  await saveImageMap(
    "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/abcdefgh-1234-5678-abcd-123456789012/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=CREDENTIALCREDENTIALCREDENTIAL0%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220101T000000Z&X-Amz-Expires=3600&X-Amz-Signature=signaturedummyasignaturedummyasignaturedummyasignaturedummyadef3&X-Amz-SignedHeaders=host&x-id=GetObject",
    "static/pimages/page-object-id/abcdefgh-1234-5678-abcd-123456789012-Untitled.png"
  );
  await saveImageMap(
    "https://prod-files-secure.s3.us-west-2.amazonaws.com/01010101-0101-4070-0101-478b36d11111/01010101-0101-0101-0101-101010101010/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT7",
    "static/pimages/page-object-id/01010101-0101-4070-0101-478b36d11111-01010101-0101-0101-0101-101010101010-Untitled.png"
  );
});

describe("convertS3ImageUrl", () => {
  test("Matches the AWS url", async () => {
    const md_one = `
# Hello notion with s3 image

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/abcdefgh-1234-5678-abcd-123456789012/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=CREDENTIALCREDENTIALCREDENTIAL0%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220101T000000Z&X-Amz-Expires=3600&X-Amz-Signature=signaturedummyasignaturedummyasignaturedummyasignaturedummyadef3&X-Amz-SignedHeaders=host&x-id=GetObject)

![Image Title](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/abcdefgh-1234-5678-abcd-123456789012/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=CREDENTIALCREDENTIALCREDENTIAL0%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220101T000000Z&X-Amz-Expires=3600&X-Amz-Signature=signaturedummyasignaturedummyasignaturedummyasignaturedummyadef3&X-Amz-SignedHeaders=host&x-id=GetObject)

end of md
`;

    const md_one_expected = `
# Hello notion with s3 image

![](/pimages/page-object-id/abcdefgh-1234-5678-abcd-123456789012-Untitled.png)

![Image Title](/pimages/page-object-id/abcdefgh-1234-5678-abcd-123456789012-Untitled.png)

end of md
`;

    const result = await convertS3ImageUrl(md_one);
    expect(result).toBe(md_one_expected);
  });

  // 新たなS3 URLのテストパターン
  test("Matches the new AWS url pattern", async () => {
    const md_two = `
# Test with new S3 image

![](https://prod-files-secure.s3.us-west-2.amazonaws.com/01010101-0101-4070-0101-478b36d11111/01010101-0101-0101-0101-101010101010/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT7)

end of md
`;

    const md_two_expected = `
# Test with new S3 image

![](/pimages/page-object-id/01010101-0101-4070-0101-478b36d11111-01010101-0101-0101-0101-101010101010-Untitled.png)

end of md
`;

    const result = await convertS3ImageUrl(md_two);
    expect(result).toBe(md_two_expected);
  });
});
