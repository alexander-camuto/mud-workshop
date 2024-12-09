import { anvil } from "viem/chains";
import { chainId } from "./common";

const supportedChains = [anvil];

export const chain = supportedChains.find((chain) => chain.id === chainId);
