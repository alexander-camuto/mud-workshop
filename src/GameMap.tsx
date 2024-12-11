import { Direction, enums } from "./common";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { Address } from "viem";
import { ArrowDownIcon } from "./ui/icons/ArrowDownIcon";
import { twMerge } from "tailwind-merge";
import { Player } from "./Player";

export type Props = {
  readonly player?: {
    readonly player: Address;
    readonly x: number;
    readonly y: number;
  };

  readonly players?: readonly {
    readonly player: Address;
    readonly x: number;
    readonly y: number;
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

  return (
    <div className="absolute inset-0 grid sm:grid-cols-[auto_16rem] place-items-center p-4">
    <div className="aspect-square bg-lime-500 w-full max-w-[50rem] shadow-[0_0_10vmax_0_var(--tw-shadow-color)] shadow-lime-700">
      <div className="relative w-full h-full">
        {/* Chain Labels at the top */}
        <div className="absolute left-0 top-4 w-1/2 text-center">
          <span className="text-blue-500 font-bold text-2xl">CHAIN 1</span>
        </div>
        <div className="absolute right-0 top-4 w-1/2 text-center">
          <span className="text-red-500 font-bold text-2xl">CHAIN 2</span>
        </div>

        {/* Portal line in the middle */}
        <div className="absolute left-1/2 top-0 h-full w-4 -ml-2"
          style={{
            background: 'url("/portal.gif")',
            backgroundSize: '16px 16px',
            backgroundRepeat: 'repeat-y',
            boxShadow: '0 0 20px 0 rgba(88, 40, 178, 0.7)'
          }}
        />
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
            <Player key={player.player} player={player}/>
        ))}
        </div>
      </div>
    </div>
  );
}
