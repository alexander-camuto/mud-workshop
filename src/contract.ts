import worlds from "../worlds.json";
import { chainId } from "./common";

export const world = worlds[`${chainId}`]!;
