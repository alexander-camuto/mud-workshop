import { Direction, enums, scale, tables } from "./common";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { Address } from "viem";
import { ArrowDownIcon } from "./ui/icons/ArrowDownIcon";
import { twMerge } from "tailwind-merge";
import { Player } from "./Player";
import { useRecords } from "./mud/useRecords";
import { stash1, stash2 } from "./mud/stash";

export type Props = {
  readonly players?: readonly {
    readonly player: Address;
    readonly x: number;
    readonly y: number;
    readonly direction: number;
    readonly owned: boolean;
  }[];

  readonly onMove?: (direction: Direction) => void;
};

const rotateClassName = {
  North: "rotate-0",
  East: "rotate-90",
  South: "rotate-180",
  West: "-rotate-90",
} as const satisfies Record<Direction, `${"" | "-"}rotate-${number}`>;

export function GameMap({ players = [], onMove }: Props) {
  useKeyboardMovement(onMove);

  const portals1 = useRecords({ stash: stash1, table: tables.Portal });
  const portals2 = useRecords({ stash: stash2, table: tables.Portal });
  const portals = [...portals1, ...portals2];

  return (
    <div className="w-full absolute inset-0 grid place-items-center">
      <div className="aspect-square bg-lime-500 w-full max-w-[50rem] shadow-[0_0_10vmax_0_var(--tw-shadow-color)] shadow-lime-700">
        <div className="relative w-full h-full">
          {/* Chain Labels at the top */}
          <div className="absolute left-0 top-4 w-1/2 text-center">
            <span className="text-blue-500 font-bold text-2xl">CHAIN 1</span>
          </div>
          <div className="absolute right-0 top-4 w-1/2 text-center">
            <span className="text-red-500 font-bold text-2xl">CHAIN 2</span>
          </div>

          {/* Individual portal tiles */}
          {[...portals].map((portal, index) => (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                left: `${portal.x * scale}%`,
                top: `${portal.y * scale}%`,
                background: 'url("/portal.gif")',
                backgroundSize: "cover",
                boxShadow: "0 0 10px 0 rgba(88, 40, 178, 0.7)",
                height: `${scale}%`,
                width: `${scale}%`,
                transform: `scale(2)`,
              }}
            />
          ))}
          {onMove
            ? enums.Direction.map((direction) => (
                <button
                  key={direction}
                  title={`Move ${direction.toLowerCase()}`}
                  className={twMerge(
                    "outline-0 absolute inset-0 cursor-pointer grid p-4",
                    rotateClassName[direction],
                    "transition bg-gradient-to-t from-transparent via-transparent to-blue-50 text-blue-400 opacity-0 hover:opacity-40 active:opacity-100"
                  )}
                  style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 50%)" }}
                  onClick={() => onMove(direction)}
                >
                  <ArrowDownIcon className="rotate-180 text-4xl self-start justify-self-center" />
                </button>
              ))
            : null}

          {players.map((player) => (
            <Player key={player.player} player={player} />
          ))}
        </div>
      </div>
    </div>
  );
}
