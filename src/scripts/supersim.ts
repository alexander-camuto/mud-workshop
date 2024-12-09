import { spawn } from "child_process";
import path from "path";
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

async function runSupersim() {
  // Get the path to the supersim binary in node_modules
  const supersimPath = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    "supersim",
  );

  try {
    const supersim = spawn(supersimPath, [], {
      stdio: "inherit", // This will pipe the output to the current process
    });

    // Handle process exit
    supersim.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Supersim process exited with code ${code}`);
        process.exit(code || 1);
      }
    });

    // Handle process errors
    supersim.on("error", (err) => {
      console.error("Failed to start supersim:", err);
      process.exit(1);
    });

    // Handle process termination
    process.on("SIGINT", () => {
      supersim.kill("SIGINT");
    });
    process.on("SIGTERM", () => {
      supersim.kill("SIGTERM");
    });

    // Wait a bit for the nodes to start up
    await new Promise((resolve) => setTimeout(resolve, 20000));

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
runSupersim().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
