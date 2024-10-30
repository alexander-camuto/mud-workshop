import worldAbi from "../out/IWorld.sol/IWorld.abi.json";
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

export const chainId = parseInt(import.meta.env.VITE_CHAIN_ID) || 31337;

export const url = new URL(window.location.href);

export { worldAbi };
