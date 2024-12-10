import { Address, Log, concat, testActions } from "viem";
import { ExtractAbiEvent } from "abitype";
import { abi } from "./common";
import { getWorld } from "./contract";
import { ExtendedClient, clients } from "./client";

type CrosschainLog = Log<
  bigint,
  number,
  false,
  ExtractAbiEvent<typeof abi, "World_CrosschainRecord">,
  true
>;

interface CrosschainIdentifier {
  origin: Address;
  blockNumber: bigint;
  logIndex: bigint;
  timestamp: bigint;
  chainId: bigint;
}

async function fetchTimestamp(client: ExtendedClient, blockNumber?: bigint) {
  const { timestamp } = await client.getBlock({
    blockNumber,
  });
  return timestamp;
}

async function buildIdentifier(
  client: ExtendedClient,
  log: CrosschainLog,
): Promise<CrosschainIdentifier> {
  const timestamp = await fetchTimestamp(client, log.blockNumber);
  return {
    origin: log.address,
    blockNumber: log.blockNumber,
    logIndex: BigInt(log.logIndex),
    timestamp,
    chainId: BigInt(client.chain.id),
  };
}

export async function relay(
  sourceClient: ExtendedClient,
  crosschainLog: CrosschainLog,
) {
  const targetClient = clients.find(
    (client) => client.chain.id === Number(crosschainLog.args.toChainId),
  );
  if (!targetClient) {
    throw new Error("Relayer: invalid chain id");
  }
  const identifier = await buildIdentifier(sourceClient, crosschainLog);
  const message = concat([...crosschainLog.topics, crosschainLog.data]);

  const world = getWorld(targetClient);

  const currentTimestamp = await fetchTimestamp(targetClient);

  if (currentTimestamp < identifier.timestamp) {
    // Just for the demo
    const testClient = targetClient.extend((config) => ({
      mode: "anvil",
      ...testActions({ mode: "anvil" })(config),
    }));
    await testClient.setNextBlockTimestamp({
      timestamp: identifier.timestamp,
    });
    await testClient.mine({ blocks: 1 });
  }

  return world.write.crosschainWrite([identifier, message]);
}
