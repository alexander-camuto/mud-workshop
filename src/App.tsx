import { useMemo } from "react";
import { useSyncProgress } from "./mud/useSyncProgress";
import { stash } from "./mud/stash";
import { abi, Direction, enums, mapSize, tables } from "./common";
import { useRecords } from "./mud/useRecords";
import { GameMap } from "./GameMap";
import { useWorldContract } from "./useWorldContract";
import { account } from "./account";
import {clients} from "./client";
import { parseEventLogs } from "viem";
import { relay } from "./relay";

export function App() {
  const { isLive, message, percentage } = useSyncProgress();

  const players = useRecords({ stash, table: tables.Position });

  const worldContracts = useWorldContract();

  const currentPlayer = players.find(player => player.player.toLowerCase() ===
        account.address?.toLowerCase());

  const onMove = useMemo(
    () => async (direction: Direction) => {

    const currentPlayer = players.find(player => player.player.toLowerCase() ===
        account.address?.toLowerCase());

      if (!worldContracts) {
        console.warn("World contracts not available");
        return;
      }

      const [world, client] = (!currentPlayer || currentPlayer.x < mapSize / 2)
        ? [worldContracts[0], clients[0]]
        : [worldContracts[1], clients[1]];

        const hash = await world.worldContract.write.app__move([
          enums.Direction.indexOf(direction),
        ], { gasPrice: BigInt(0)});

      await world.waitForTransaction(hash);

      const receipt = await client.waitForTransactionReceipt({ hash });
      const logs = parseEventLogs({ abi, eventName: "World_CrosschainRecord", logs: receipt.logs});
      console.log({ logs })
      await Promise.all(logs.map(log =>
        relay(client, log)
      ))
    },
    [worldContracts, players]
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
