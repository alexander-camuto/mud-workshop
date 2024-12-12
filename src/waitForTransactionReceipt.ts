import { Hex } from "viem";
import { ExtendedClient } from "./client";

// Continuously retry fetching receipt so we avoid issues with automine
export async function waitForTransactionReceipt(
  client: ExtendedClient,
  hash: Hex,
) {
  while (true) {
    try {
      return await client.getTransactionReceipt({ hash });
    } catch (e) {
      // console.error(e instanceof Error ? e.message : String(e));
      console.warn("Retrying fetching transaction receipt");
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
