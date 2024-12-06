// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {StoreSwitch} from "@latticexyz/store/src/StoreSwitch.sol";
import {System} from "@latticexyz/world/src/System.sol";

import {IWorld} from "./codegen/world/IWorld.sol";
import {Direction} from "./codegen/common.sol";
import {Position, PositionData} from "./codegen/tables/Position.sol";
import {MAP_SIZE} from "./constants.sol";

interface IVerifier {
  function verifyProof(bytes calldata proof, uint256[] calldata instances) external returns (bool);
}

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

    IWorld(world).app__move(direction);
  }
}

