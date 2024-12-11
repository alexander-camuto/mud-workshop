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
      return positions.filter((position) => {
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
        return crosschainRecord?.owned;
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

  const currentPlayer = players.find(
    (player) => player.player.toLowerCase() === account.address?.toLowerCase(),
  );

  const onMove = useMemo(
    () => async (direction: Direction) => {
      if (!worldContracts) {
        console.warn("World contracts not available");
        return;
      }

      // TODO: !currentPlayer will also be true when bridging
      const [world, client] =
        !currentPlayer || currentPlayer.x < mapSize / 2
          ? [worldContracts[0], clients[0]]
          : [worldContracts[1], clients[1]];

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
      await Promise.all(logs.map((log) => relay(client, log)));
    },
    [worldContracts, currentPlayer],
  );

  return (
    <>
      {isLive ? (
        <GameMap player={currentPlayer} players={players} onMove={onMove} />
      ) : (
        <div className="tabular-nums">
          {message} ({percentage.toFixed(1)}%)…
        </div>
      )}
    </>
  );
}
