import { useMemo } from "react";
import { useSyncProgress } from "./mud/useSyncProgress";
import { Explorer } from "./Explorer";
import { stash } from "./mud/stash";
import { Direction, enums, mapSize, tables } from "./common";
import { useRecords } from "./mud/useRecords";
import { GameMap } from "./GameMap";
import { Tasks } from "./Tasks";
import { useWorldContract } from "./useWorldContract";
import { account } from "./account";

export function App() {
  const { isLive, message, percentage } = useSyncProgress();

  const players = useRecords({ stash, table: tables.Position });

  const { worldContract1, worldContract2 } = useWorldContract();
  const onMove = useMemo(
    () => async (direction: Direction) => {
      const currentPlayer = players.find(player => player.player.toLowerCase() ===
            account.address?.toLowerCase());

      if (!worldContract1 || !worldContract2) {
        console.warn("World contract not available");
        return;
      }

      // Not assigning worldContractX to a variable because of typing issues
      if (!currentPlayer || currentPlayer.x < mapSize / 2) {
            await worldContract1.write.app__move([
              enums.Direction.indexOf(direction),
            ]);
      } else {
            await worldContract2.write.app__move([
              enums.Direction.indexOf(direction),
            ]);
      }
    },
    [worldContract1, worldContract2, players]
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
