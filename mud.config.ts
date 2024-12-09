import { defineWorld } from "@latticexyz/world";

export default defineWorld({
  sourceDirectory: "contracts",
  namespace: "app",
  enums: {
    Direction: ["North", "East", "South", "West"],
  },
  tables: {
    Tasks: {
      schema: {
        id: "uint256",
        createdAt: "uint256",
        completedAt: "uint256",
        description: "string",
      },
      key: ["id"],
    },
    Position: {
      schema: { player: "address", x: "uint32", y: "uint32" },
      key: ["player"],
    },
  },
  modules: [
    {
      artifactPath:
        "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
      root: true,
    },
    {
      artifactPath:
        "@latticexyz/world-module-crosschain/out/CrosschainModule.sol/CrosschainModule.json",
      root: true,
    },
  ],
});
