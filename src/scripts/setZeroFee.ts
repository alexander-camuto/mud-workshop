import { createPublicClient, http } from "viem";

async function setZeroFee(rpcUrl: string) {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });

  try {
    await client.transport.request({
      method: "anvil_setNextBlockBaseFeePerGas",
      params: [0],
    });
    console.log(`Zero fee set for ${rpcUrl}`);
  } catch (error) {
    console.error(`Failed to set zero fee for ${rpcUrl}:`, error);
    throw error;
  }
}

async function run() {
  try {
    // Enable automine for both nodes
    // Default supersim RPC URLs for the two nodes
    const rpcUrls = ["http://127.0.0.1:9545", "http://127.0.0.1:9546"];

    // Set zero fee for each node
    await Promise.all(rpcUrls.map((url) => setZeroFee(url)));
  } catch (error) {
    console.error("Error running supersim:", error);
    process.exit(1);
  }
}

// Run the script
run().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
