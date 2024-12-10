import worldAbi from "../out/IWorld.sol/IWorld.abi.json";
// QUICK HACK CUZ IM TIRED OF THIS
import type crosschainSystemAbiType from "@latticexyz/world-module-crosschain/out/CrosschainSystem.sol/CrosschainSystem.abi.json.d.ts";
import crosschainSystemAbi from "@latticexyz/world-module-crosschain/out/CrosschainSystem.sol/CrosschainSystem.abi.json";
const typedCrosschainSystemAbi =
  crosschainSystemAbi as typeof crosschainSystemAbiType;

import mudConfig from "../mud.config";

export { mudConfig };
export type mudConfig = typeof mudConfig;

export const tables = mudConfig.namespaces.app.tables;
export type tables = typeof tables;

export const enums = mudConfig.enums;
export type enums = typeof enums;
export const enumValues = mudConfig.enumValues;
export type enumValues = typeof enumValues;

export type Direction = enums["Direction"][number];

export const mapSize = 40;

export const url = new URL(window.location.href);

export const abi = [...worldAbi, ...typedCrosschainSystemAbi] as const;

export const scale = 100 / mapSize;
