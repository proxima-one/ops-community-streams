import * as proxima from "@proxima-one/pulumi-service-apps";
import * as pulumi from "@pulumi/pulumi";
import { smartContractLogs } from "./lib/smartContractLogs";
import { wethAbi } from "./contracts/wethAbi";

const coreStreams = new pulumi.StackReference("proxima-one/core-streams/default");

const communityStreams = new proxima.StreamingAppDeployer({
  targetStack: "buh",
  targetDb: {type: "import-kafka", name: "kafka-main"},
  tuningArgs: {batch: 500, readBuffer: 10000},
  stateManager: {type: "import", name: "state-manager-secondary"},
  availableDbs: coreStreams.getOutput("streamDbs"),
  maxUndoMs: 300 * 1000,
});

communityStreams.deployAll([
  smartContractLogs({
    name: "weth",
    network: "eth-main",
    startBlock: 4719568,
    contracts: {
      weth: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        abi: wethAbi,
      }
    },
  })
]);

export const streamDbs = [communityStreams.getTargetDb()];
