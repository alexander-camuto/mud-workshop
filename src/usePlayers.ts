import { useStash } from "@latticexyz/stash/react";
import { Stash, getRecord, getRecords } from "@latticexyz/stash/internal";
import { encodeAbiParameters, keccak256, pad } from "viem";
import isEqual from "fast-deep-equal";
import { tables } from "./common";

export function usePlayers(stash: Stash) {
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
        return {
          ...position,
          timestamp: Number(crosschainRecord?.timestamp!),
          owned: crosschainRecord?.owned!,
        };
      });
    },
    {
      isEqual,
    },
  );
}
