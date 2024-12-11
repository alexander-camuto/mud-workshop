// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {StoreSwitch} from "@latticexyz/store/src/StoreSwitch.sol";
import {Portal, PortalData} from "../codegen/tables/Portal.sol";

import {IWorld} from "../codegen/world/IWorld.sol";

contract PostDeploy is Script {
  function run(address worldAddress) external {
    StoreSwitch.setStoreAddress(worldAddress);
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    if (block.chainid == 901) {
      Portal.set(5, 5, PortalData({ toX: 25, toY: 25, toChainId: 902 }));
    }

    if (block.chainid == 902) {
      Portal.set(25, 25, PortalData({ toX: 5, toY: 5, toChainId: 901 }));
    }

    vm.stopBroadcast();
  }
}
