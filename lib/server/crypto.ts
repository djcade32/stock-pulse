// Node runtime version; for Edge use Web Crypto instead.
import { createHash } from "crypto";

export async function sha256(input: string): Promise<string> {
  return createHash("sha256").update(input, "utf8").digest("hex");
}
