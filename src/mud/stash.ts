import { createStash } from "@latticexyz/stash/internal";
import config from "../../mud.config";
import crosschainConfig from "@latticexyz/world-module-crosschain/mud.config";

const combinedConfig = {
  namespaces: {
    ...config.namespaces,
    ...crosschainConfig.namespaces,
  },
};

export const stash1 = createStash(combinedConfig);
export const stash2 = createStash(combinedConfig);
