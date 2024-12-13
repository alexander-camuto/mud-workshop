import { Address, stringify } from "viem";
import { scale } from "./common";
import { account } from "./account";

export type Props = {
  readonly player?: {
    readonly player: Address;
    readonly x: number;
    readonly y: number;
    readonly direction: number;
    readonly owned: boolean;
  };
};

export function Player({ player }: Props) {
  if (!player) return null;

  const isCurrentPlayer =
    player.player.toLowerCase() === account.address.toLowerCase();

  return (
    <div
      className="absolute"
      style={{
        height: `${scale}%`,
        width: `${scale}%`,
        left: `${player.x * scale}%`,
        top: `${player.y * scale}%`,
        // transform: `translate(-50%, 50%)`,
        transform: `scale(1.5)`,
        zIndex: isCurrentPlayer ? 1001 : 1000,
      }}
      title={stringify(player, null, 2)}
    >
      <div className="relative w-full h-full">
        {isCurrentPlayer && (
          <div className="absolute inset-0  rounded-full bg-purple-400 opacity-90 animate-ping" />
        )}
        <img
          src={"/fly.png"}
          className={`
            pointer-events-none select-none touch-none
            transition-all duration-100 ease-out
            ${!isCurrentPlayer && "opacity-90"}
            ${!player.owned && "animate-warp"}
          `}
          style={{
            transform: `rotate(${player.direction * 90}deg)`,
          }}
        />
      </div>
    </div>
  );
}
