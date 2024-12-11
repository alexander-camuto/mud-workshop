import { useMemo } from "react";
import { useSyncProgress } from "./mud/useSyncProgress";
import { stash1, stash2 } from "./mud/stash";
import { abi, Direction, enums, mapSize, tables } from "./common";
import { GameMap } from "./GameMap";
import { useWorldContract } from "./useWorldContract";
import { account } from "./account";
import { clients } from "./client";
import { keccak256, parseEventLogs, encodeAbiParameters, pad } from "viem";
import { relay } from "./relay";
import { useStash } from "@latticexyz/stash/react";
import { Stash, getRecord, getRecords } from "@latticexyz/stash/internal";

function usePlayers(stash: Stash) {
  return useStash(
    stash,
    (state) => {
      const positions = Object.values(
        getRecords({ state, table: tables.Position }),
      );
      return positions.map((position) => {
        const keyHash = keccak256(
          encodeAbiParameters(
            [{ type: "bytes32[]" }],
            [[pad(position.player)]],
          ),
        );
        const crosschainRecord = getRecord({
          state,
          table: tables.CrosschainRecord,
          key: {
            tableId: tables.Position.tableId,
            keyHash,
          },
        });
        return {
          ...position,
          timestamp: Number(crosschainRecord?.timestamp!),
          owned: crosschainRecord?.owned!,
        };
      });
    },
    {
      isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  );
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

  const currentPlayer = useMemo(
    () =>
      players
        .filter(
          (player) =>
            player.player.toLowerCase() === account.address?.toLowerCase(),
        )
        .sort((a, b) => (b.owned ? 1 : 0) - (a.owned ? 1 : 0))
        .at(0),
    [players],
  );

  const onMove = useMemo(
    () => async (direction: Direction) => {
      if (!worldContracts) {
        console.warn("World contracts not available");
        return;
      }

      if (currentPlayer && !currentPlayer?.owned) {
        console.warn("Can't move while bridging");
        return;
      }

      const [world, client] =
        !currentPlayer || currentPlayer.x < mapSize / 2
          ? [worldContracts[0], clients[0]]
          : [worldContracts[1], clients[1]];

      try {
        const hash = await world.worldContract.write.app__move([
          enums.Direction.indexOf(direction),
        ]);

        await world.waitForTransaction(hash);

        const receipt = await client.waitForTransactionReceipt({ hash });
        const logs = parseEventLogs({
          abi,
          eventName: "World_CrosschainRecord",
          logs: receipt.logs,
        });

        if (logs.length > 0) {
          await Promise.all(logs.map((log) => relay(client, log)));
        }
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
        <GameMap players={playersToRender} onMove={onMove} />
      ) : (
        <div className="tabular-nums">
          {message} ({percentage.toFixed(1)}%)…
        </div>
      )}
    </>
  );
}
