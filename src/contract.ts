import _worlds from "../worlds.json";
import { chains } from "./chain";

export const worlds = [
  _worlds[`${chains[0].id}`]!,
  _worlds[`${chains[1].id}`]!,
] as const;
