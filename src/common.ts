import worldAbi from "../out/IWorld.sol/IWorld.abi.json";
import crosschainSystemAbi from "@latticexyz/world-module-crosschain/out/CrosschainSystem.sol/CrosschainSystem.abi.json";
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

// export const chainIds = [901, 902] as const;

export const mapSize = 40;

export const url = new URL(window.location.href);

export { worldAbi, crosschainSystemAbi };
