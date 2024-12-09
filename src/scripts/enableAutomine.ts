import { createPublicClient, http } from "viem";

async function enableAutomine(rpcUrl: string) {
  const client = createPublicClient({
    transport: http(rpcUrl),
  });

  try {
    // First, disable interval mining by setting interval to 0
    await client.transport.request({
      method: "evm_setIntervalMining",
      params: [0],
    });
    console.log(`Interval mining disabled for ${rpcUrl}`);

    // Then enable automine
    await client.transport.request({
      method: "evm_setAutomine",
      params: [true],
    });
    console.log(`Automine enabled for ${rpcUrl}`);
  } catch (error) {
    console.error(`Failed to configure mining for ${rpcUrl}:`, error);
    throw error;
  }
}

async function run() {
  try {
    // Enable automine for both nodes
    // Default supersim RPC URLs for the two nodes
    const rpcUrls = ["http://127.0.0.1:9545", "http://127.0.0.1:9546"];

    // Enable automine for each node
    await Promise.all(rpcUrls.map((url) => enableAutomine(url)));
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
