import * as proxima from "@proxima-one/pulumi-service-apps";
import * as pulumi from "@pulumi/pulumi";
import { SmartContract, smartContractLogs } from "./lib/smartContractLogs";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { appParser } from "./app";

const coreStreams = new pulumi.StackReference("proxima-one/core-streams/default");

const communityStreams = new proxima.StreamingAppDeployer({
  targetStack: "buh",
  targetDb: {type: "import-kafka", name: "core-us"},
  tuningArgs: {batch: 500, readBuffer: 10000},
  stateManager: {type: "import", name: "state-manager-secondary"},
  availableDbs: coreStreams.getOutput("streamDbs"),
  maxUndoMs: 300 * 1000,
});

const contractsPath = path.join(__dirname, "../contracts");
const authors = fs.readdirSync(contractsPath);

for (const author of authors) {
  const authorPath = path.join(contractsPath, author);
  const apps = fs.readdirSync(authorPath);

  for (const app of apps) {
    const appPath = path.join(authorPath, app);

    const metaPath = path.join(appPath, "app.yml");
    if (!fs.existsSync(metaPath))
      throw new Error(`App metadata doesn't exist: ${metaPath}`);

    const appMetaJson = JSON.stringify(yaml.load(fs.readFileSync(metaPath).toString()));

    const appMeta = appParser.parse(appMetaJson);
    const contracts: Record<string, SmartContract> = {};

    for (const contractName of Object.keys(appMeta.contracts)) {
      const contract = appMeta.contracts[contractName] as any;
      contracts[contractName] = {
        address: contract.address,
        abi: JSON.parse(fs.readFileSync(path.join(appPath, contract.abi)).toString()),
      };
    }

    communityStreams.deploy(smartContractLogs({
      name: appMeta.name,
      author: author == "_" ? undefined : author,
      network: appMeta.network,
      version: appMeta.version,
      startBlock: appMeta.startBlock,
      contracts: contracts
    }));
  }
}

export const streamDbs = [communityStreams.getTargetDb()];
