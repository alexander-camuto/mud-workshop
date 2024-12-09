import { useMemo } from "react";
import { useSyncProgress } from "./mud/useSyncProgress";
import { Explorer } from "./Explorer";
import { stash } from "./mud/stash";
import { crosschainSystemAbi, Direction, enums, mapSize, tables } from "./common";
import { useRecords } from "./mud/useRecords";
import { GameMap } from "./GameMap";
import { Tasks } from "./Tasks";
import { useWorldContract } from "./useWorldContract";
import { account } from "./account";
import {clients} from "./client";
import { parseEventLogs } from "viem";

export function App() {
  const { isLive, message, percentage } = useSyncProgress();

  const players = useRecords({ stash, table: tables.Position });

  const worldContracts = useWorldContract();

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
        ]);

      await world.waitForTransaction(hash);

      // const receipt = await client.getTransactionReceipt({ hash });
      // const logs = parseEventLogs({ abi: crosschainSystemAbi, eventName: "World_CrosschainRecord", logs: receipt.logs});
      // await Promise.all(logs.map(log => {
      //   console.log(log.args as any);
      // }))
    },
    [worldContracts, players]
  );

  return (
    <div className="absolute inset-0 grid sm:grid-cols-[auto_16rem]">
      <div className="p-4 grid place-items-center">
        {isLive ? (
          <GameMap players={players} onMove={onMove} />
        ) : (
          <div className="tabular-nums">
            {message} ({percentage.toFixed(1)}%)…
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">{isLive ? <Tasks /> : null}</div>

      <Explorer />
    </div>
  );
}
