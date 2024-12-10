import { getBurnerPrivateKey } from "@latticexyz/common";
import { privateKeyToAccount } from "viem/accounts";

export const account = privateKeyToAccount(getBurnerPrivateKey());
