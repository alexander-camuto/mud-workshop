import { serialize, useAccount } from "wagmi";
import { Direction, enums } from "./common";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { Address, Hex, hexToBigInt, keccak256 } from "viem";
import { ArrowDownIcon } from "./ui/icons/ArrowDownIcon";
import { Button } from "./ui/Button";
import { twMerge } from "tailwind-merge";
import { NPCState } from "./useNPC";

export type Props = {
  readonly players?: readonly {
    readonly player: Address;
    readonly x: number;
    readonly y: number;
  }[];

  readonly onPlayerMove?: (direction: Direction) => void;
  readonly onHunterMove?: (hunter: Address) => void;
  readonly onAddHunter?: (target: Address) => void;
};

const size = 40;
const scale = 100 / size;

function getColorAngle(seed: Hex) {
  return Number(hexToBigInt(keccak256(seed)) % 360n);
}

const rotateClassName = {
  North: "rotate-0",
  East: "rotate-90",
  South: "rotate-180",
  West: "-rotate-90",
} as const satisfies Record<Direction, `${"" | "-"}rotate-${number}`>;

export function GameMap({ players = [], onPlayerMove, onHunterMove, onAddHunter }: Props) {
  const { address: userAddress } = useAccount();
  const isUser = (player: Address) => player?.toLowerCase() === userAddress?.toLowerCase();

  useKeyboardMovement(onPlayerMove);
  return (
    <div className="aspect-square w-full max-w-[40rem]">
     
      <div className="relative w-full h-full border-8 border-black/10">
        {onPlayerMove
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
                onClick={() => onPlayerMove(direction)}
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
            {isUser(player.player) ? (
              <div className="w-full h-full bg-current animate-ping opacity-50" />
	    ) : null}
          </div>
        ))}
      </div>
      <div className="p-4">
	{players.filter(p => !isUser(p.player)).map(p => (
	  <button key={p.player} className="text-4xl" onClick={() => {
	    onHunterMove(p.player, userAddress);
	  }}>🤖</button>
	))}
	<Button onClick={() => {
	  onAddHunter(userAddress);
	}}>➕</Button>
      </div>
    </div>
  );
}
