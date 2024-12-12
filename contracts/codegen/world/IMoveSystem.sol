// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

/* Autogenerated file. Do not edit manually. */

import { Direction } from "../common.sol";

/**
 * @title IMoveSystem
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev This interface is automatically generated from the corresponding system contract. Do not edit manually.
 */
interface IMoveSystem {
  function app__move(Direction direction) external;

  function app__setPosition(address player, uint32 x, uint32 y) external;
}
