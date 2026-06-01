import { expect, test } from "vite-plus/test";
import { WingetClient, WingetPlatformError } from "../src/index.ts";

test("throws WingetPlatformError on non-Windows", async () => {
  const client = new WingetClient();
  await expect(client.run(["--version"])).rejects.toThrow(WingetPlatformError);
});
