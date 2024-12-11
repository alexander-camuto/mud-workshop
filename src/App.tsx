import { useMemo, useState } from "react";
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
        return { ...position, owned: crosschainRecord?.owned || false };
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

  const ownedPlayers = players.filter((player) => player.owned);

  const worldContracts = useWorldContract();

  const playerExists = players.some(
    (player) => player.player.toLowerCase() === account.address?.toLowerCase(),
  );

  const currentPlayer = ownedPlayers.find(
    (player) => player.player.toLowerCase() === account.address?.toLowerCase(),
  );

  const onMove = useMemo(
    () => async (direction: Direction) => {
      if (!worldContracts) {
        console.warn("World contracts not available");
        return;
      }

      if (playerExists && !currentPlayer) {
        console.warn("Can't move while bridging");
        return;
      }

      const [world, client] =
        !playerExists || currentPlayer!.x < mapSize / 2
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
    [worldContracts, currentPlayer, playerExists],
  );

  return (
    <>
      {isLive ? (
        <GameMap
          player={currentPlayer}
          players={ownedPlayers}
          onMove={onMove}
        />
      ) : (
        <div className="tabular-nums">
          {message} ({percentage.toFixed(1)}%)…
        </div>
      )}
    </>
  );
}
