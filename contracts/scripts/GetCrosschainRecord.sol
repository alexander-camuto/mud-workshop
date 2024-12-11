// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {StoreSwitch} from "@latticexyz/store/src/StoreSwitch.sol";
import {CrosschainRecord, CrosschainRecordData} from "@latticexyz/world-module-crosschain/src/namespaces/crosschain/codegen/tables/CrosschainRecord.sol";
import {Position} from "../codegen/tables/Position.sol";

import {IWorld} from "../codegen/world/IWorld.sol";

contract GetCrosschainRecord is Script {
  function run(address worldAddress, address player) external {
    StoreSwitch.setStoreAddress(worldAddress);

    bytes32 keyHash = keccak256(abi.encode(Position.encodeKeyTuple(player)));
    CrosschainRecordData memory data = CrosschainRecord.get(Position._tableId, keyHash);

    console.log(data.owned);
  }
}
