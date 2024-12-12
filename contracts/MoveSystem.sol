// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {System} from "@latticexyz/world/src/System.sol";

import {Direction} from "./codegen/common.sol";
import {Position, PositionData} from "./codegen/tables/Position.sol";
import {MAP_SIZE} from "./constants.sol";

contract MoveSystem is System {
  function move(Direction direction) public {
    address player = _msgSender();
    PositionData memory position = Position.get(player);

    uint32 targetX = position.x;
    uint32 targetY = position.y;
    if (direction == Direction.North && targetY > 0) {
      targetY -= 1;
    } else if (direction == Direction.East && targetX < MAP_SIZE - 1) {
      targetX += 1;
    } else if (direction == Direction.South && targetY < MAP_SIZE - 1) {
      targetY += 1;
    } else if (direction == Direction.West && targetX > 0) {
      targetX -= 1;
    }
    position.x = targetX;
    position.y = targetY;
    Position.set(player, position);
  }
  function setPosition(address player, uint32 x, uint32 y) public {
    PositionData memory initialPosition = PositionData({x: x, y: y});
    Position.set(player, initialPosition);
  }
}
