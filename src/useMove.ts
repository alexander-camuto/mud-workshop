import { useMutation } from "@tanstack/react-query";
import { Direction, enums } from "./common";
import { useWorldContract } from "./useWorldContract";

export function useMove() {
  const {
    worldContract1,
    waitForTransaction1,
    worldContract2,
    waitForTransaction2,
  } = useWorldContract();

  const mutationKey = ["move", worldContract1?.address];
  return useMutation<void, Error, Direction>({
    mutationKey,
    async mutationFn(direction) {
      if (!worldContract1) {
        throw new Error("World contract not ready. Are you connected?");
      }

      console.log("submitting move", direction);

      const tx = await worldContract1.write.app__move([
        enums.Direction.indexOf(direction),
      ]);

      console.log("waiting for move receipt", tx);
      const receipt = await waitForTransaction1(tx);

      console.log("move done", receipt);
    },
  });
}
