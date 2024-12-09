import { serialize } from "wagmi";
import { Direction, enums, mapSize } from "./common";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { Address, Hex, hexToBigInt, keccak256 } from "viem";
import { ArrowDownIcon } from "./ui/icons/ArrowDownIcon";
import { twMerge } from "tailwind-merge";
import { clients } from "./client";

export type Props = {
  readonly players?: readonly {
    readonly player: Address;
    readonly x: number;
    readonly y: number;
  }[];

  readonly onMove?: (direction: Direction) => void;
};

const scale = 100 / mapSize;

function getColorAngle(seed: Hex) {
  return Number(hexToBigInt(keccak256(seed)) % 360n);
}

const rotateClassName = {
  North: "rotate-0",
  East: "rotate-90",
  South: "rotate-180",
  West: "-rotate-90",
} as const satisfies Record<Direction, `${"" | "-"}rotate-${number}`>;

export function GameMap({ players = [], onMove }: Props) {
  useKeyboardMovement(onMove);
  return (
    <div className="aspect-square w-full max-w-[40rem]">
      <div className="relative w-full h-full border-8 border-black/10">
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
          <div
            key={player.player}
            className="absolute bg-current"
            style={{
              color: `hwb(${getColorAngle(player.player)} 40% 20%)`,
              width: `${scale}%`,
              height: `${scale}%`,
              left: `${player.x * scale}%`,
              top: `${player.y * scale}%`,
            }}
            title={serialize(player, null, 2)}
          >
            {player.player.toLowerCase() ===
            clients[0].account.address?.toLowerCase() ? (
              <div className="w-full h-full bg-current animate-ping opacity-50" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
