import { useMemo } from "react";
import { AccountButton } from "@latticexyz/entrykit/internal";
import { useSyncProgress } from "./mud/useSyncProgress";
import { Explorer } from "./Explorer";
import { stash } from "./mud/stash";
import { Direction, enums, tables } from "./common";
import { useRecords } from "./mud/useRecords";
import { GameMap } from "./GameMap";
import { useWorldContract } from "./useWorldContract";
import { useNPC } from "./useNPC";

export function App() {
  const { isLive, message, percentage } = useSyncProgress();

  const players = useRecords({ stash, table: tables.Position });

  const { worldContract, deployNPC } = useWorldContract();
  const onPlayerMove = useMemo(
    () =>
      worldContract
        ? async (direction: Direction) => {
            await worldContract.write.app__move([
              enums.Direction.indexOf(direction),
            ]);
          }
        : undefined,
    [worldContract]
  );

  const npc = useNPC();

  return (
    <div className="absolute inset-0 grid sm:grid-cols-[auto_16rem]">
      <div className="p-4 grid place-items-center">
        {isLive ? (
          <GameMap players={players} onPlayerMove={onPlayerMove} onHunterMove={npc.move} onAddHunter={deployNPC} />
        ) : (
          <div className="tabular-nums">
            {message} ({percentage.toFixed(1)}%)…
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <AccountButton />
      </div>

      <Explorer />
    </div>
  );
}
