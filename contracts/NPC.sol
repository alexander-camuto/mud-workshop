// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {StoreSwitch} from "@latticexyz/store/src/StoreSwitch.sol";
import {System} from "@latticexyz/world/src/System.sol";

import {IWorld} from "./codegen/world/IWorld.sol";
import {Direction} from "./codegen/common.sol";
import {Position, PositionData} from "./codegen/tables/Position.sol";
import {MAP_SIZE} from "./constants.sol";
import {IVerifier} from "./IVerifier.sol";

// Simple NPC
contract NPC {
  error InvalidProof();

  IWorld immutable world;
  IVerifier immutable verifier;
  address immutable target;

  constructor(IWorld _world, IVerifier _verifier, address _target) {
    StoreSwitch.setStoreAddress(address(_world));
    world = _world;
    verifier = _verifier;
    target = _target;

    // sets initial position as oposite to player 0,0
    IWorld(world).app__setPosition(address(this), 39, 39);
  }

  function move(bytes calldata proof, Direction direction) external {
    PositionData memory npcPosition = Position.get(address(this));
    PositionData memory targetPosition = Position.get(target);

    // instances = [player_x, player_y, hunter_x, hunter_y, proposed_move]
    uint256[] memory instances = new uint256[](5);
    instances[0] = targetPosition.x;
    instances[1] = targetPosition.y;
    instances[2] = npcPosition.x;
    instances[3] = npcPosition.y;
    // TODO: actually not sure what instance should be for proposed_move
    instances[4] = uint256(direction);

    if (!verifier.verifyProof(proof, instances)) {
      revert InvalidProof();
    }

    // NPC speaks a different language  ¯\_(ツ)_/¯
    uint32 nextX = npcPosition.x;
    uint32 nextY = npcPosition.y;
    if (direction == Direction.North) {
      nextX += 1;
    } else if (direction == Direction.East) {
      nextX -= 1;
    } else if (direction == Direction.South) {
      nextY += 1;
    } else if (direction == Direction.West) {
      nextY -= 1;
    }

    IWorld(world).app__setPosition(address(this), nextX, nextY);
  }
}

