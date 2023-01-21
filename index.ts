import * as proxima from "@proxima-one/pulumi-service-apps";

const communityStreams = new proxima.StreamingAppDeployer({
  targetStack: "buh",
  targetDb: {type: "import-kafka", name: "core-us"},
  tuningArgs: {batch: 500, readBuffer: 10000},
  stateManager: {type: "import", name: "state-manager-secondary"},
  availableDbs: [], // provide readonly access to other streamdbs
  maxUndoMs: 300 * 1000,
});

export const streamDbs = [communityStreams.getTargetDb()];
