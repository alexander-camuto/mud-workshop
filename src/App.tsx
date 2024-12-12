import { useMemo } from "react";
import { useSyncProgress } from "./mud/useSyncProgress";
import { stash1, stash2 } from "./mud/stash";
import { abi, Direction, enums, mapSize } from "./common";
import { GameMap } from "./GameMap";
import { useWorldContract } from "./useWorldContract";
import { account } from "./account";
import { ExtendedClient, clients } from "./client";
import { Hex, parseEventLogs } from "viem";
import { relay } from "./relay";
import { usePlayers } from "./usePlayers";
import { Explorer } from "./Explorer";
import { getWorld } from "./contract";

const explorerUrls = [
  import.meta.env.VITE_EXPLORER_URL_1,
  import.meta.env.VITE_EXPLORER_URL2,
];

async function writeMove(
  client: ExtendedClient,
  worldContract: ReturnType<typeof getWorld>,
  direction: Direction,
) {
  const directionIndex = enums.Direction.indexOf(direction);
  await worldContract.simulate.app__move([directionIndex]);
  const hash = await worldContract.write.app__move([directionIndex]);
  // await world.waitForTransaction(hash);
  const receipt = await waitForTransactionReceipt(client, hash);

  try {
    const logs = parseEventLogs({
      abi,
      eventName: "World_CrosschainRecord",
      logs: receipt.logs,
    });

    if (logs.length > 0) {
      await Promise.all(logs.map((log) => relay(client, log)));
    }
  } catch (e) {
    console.error("Relaying failed");
  }
}

async function waitForTransactionReceipt(client: ExtendedClient, hash: Hex) {
  while (true) {
    try {
      return await client.getTransactionReceipt({ hash });
    } catch (e) {
      console.log(e instanceof Error ? e.message : String(e));
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

export function App() {
  const { isLive, message, percentage } = useSyncProgress();

  const players1 = usePlayers(stash1);
  const players2 = usePlayers(stash2);

  const players = useMemo(
    () => [...players1, ...players2],
    [players1, players2],
  );

  const worldContracts = useWorldContract();

  const currentPlayer = players
    .filter(
      (player) =>
        player.player.toLowerCase() === account.address?.toLowerCase(),
    )
    .sort((a, b) => (b.owned ? 1 : 0) - (a.owned ? 1 : 0))
    .at(0);

  const onMove = useMemo(
    () => async (direction: Direction) => {
      if (!worldContracts) {
        console.warn("World contracts not available");
        return;
      }

      const isBridging = currentPlayer && !currentPlayer.owned;

      if (isBridging) {
        console.warn("Can't move while bridging");
        return;
      }

      const [world, client] =
        !currentPlayer || currentPlayer.x < mapSize / 2
          ? [worldContracts[0], clients[0]]
          : [worldContracts[1], clients[1]];

      try {
        await writeMove(client, world.worldContract, direction);
      } catch (e) {
        console.log(e instanceof Error ? e.message : String(e));
      }
    },
    [worldContracts, currentPlayer],
  );

  // Display owned players, or if there are two non-owned players, display the most recent one
  const playersToRender = useMemo(() => {
    const playersByAddress = new Map();

    for (const player of players) {
      const address = player.player.toLowerCase();
      const existing = playersByAddress.get(address);
      if (!existing || player.owned || player.timestamp > existing.timestamp) {
        playersByAddress.set(address, player);
      }
    }
    return Array.from(playersByAddress.values());
  }, [players]);

  return (
    <>
      {isLive ? (
        <>
          <GameMap players={playersToRender} onMove={onMove} />
        </>
      ) : (
        <div className="tabular-nums">
          {message} ({percentage.toFixed(1)}%)…
        </div>
      )}
    </>
  );
}
