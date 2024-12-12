// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {System} from "@latticexyz/world/src/System.sol";

import {crosschainSystem} from
  "@latticexyz/world-module-crosschain/src/namespaces/root/codegen/systems/CrosschainSystemLib.sol";
import {CrosschainRecord, CrosschainRecordData} from
  "@latticexyz/world-module-crosschain/src/namespaces/crosschain/codegen/tables/CrosschainRecord.sol";

import {Direction} from "./codegen/common.sol";
import {Position, PositionData} from "./codegen/tables/Position.sol";
import {Portal, PortalData} from "./codegen/tables/Portal.sol";
import {MAP_SIZE} from "./constants.sol";

contract MoveSystem is System {
  error WrongChainId();
  error RecordNotOwned();

  function move(Direction direction) public {
    address player = _msgSender();
    PositionData memory position = Position.get(player);

    bytes32[] memory keyTuple = Position.encodeKeyTuple(player);
    bytes32 keyHash = keccak256(abi.encode(keyTuple));

    // If position crosschain record doesn't exist, create it
    if (CrosschainRecord.getTimestamp(Position._tableId, keyHash) == 0){
      position = getInitialPosition(player);

      if (getPositionChainId(position) != block.chainid) {
        revert WrongChainId();
      }

      Position.set(player, position);
      crosschainSystem.create(Position._tableId, keyTuple);
    }

    // Check that this chain owns the position
    if (!CrosschainRecord.getOwned(Position._tableId, keyHash)) {
      revert RecordNotOwned();
    }

    // Compute target position
    PositionData memory target = PositionData({ x: position.x, y: position.y, direction: direction });
    if (direction == Direction.North && target.y > 0) {
      target.y -= 1;
    } else if (direction == Direction.East && target.x < MAP_SIZE - 1) {
      target.x += 1;
    } else if (direction == Direction.South && target.y < MAP_SIZE - 1) {
      target.y += 1;
    } else if (direction == Direction.West && target.x > 0) {
      target.x -= 1;
    }

    // If we encounter a portal, move to the other side
    PortalData memory portal = Portal.get(target.x, target.y);
    if (portal.exists) {
      target = PositionData({ x: portal.toX, y: portal.toY, direction: direction });
    }

    Position.set(player, target);

    uint256 toChainId = getPositionChainId(target);

    // If target position is in a different chain, bridge
    if (toChainId != block.chainid) {
      crosschainSystem.bridge(Position._tableId, Position.encodeKeyTuple(player), toChainId);
    }
  }

  function getPositionChainId(PositionData memory position) private pure returns(uint256) {
    return position.x < MAP_SIZE/2 ? 901 : 902;
  }

  function getInitialPosition(address player) private pure returns(PositionData memory position) {
    position.x = uint32(uint256(keccak256(abi.encode(player))) % MAP_SIZE);
    position.y = uint32(uint256(keccak256(abi.encode(position.x))) % MAP_SIZE);
  }
}
