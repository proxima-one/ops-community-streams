import { Network, SemVer, StreamingApp } from "@proxima-one/pulumi-service-apps";

export interface SmartContract {
  abi: any;
  address: string | string[];
}

export function smartContractLogs(opts: {
  name: string,
  author?: string,
  network: Network,
  contracts: Record<string, SmartContract>,
  version: string,
  startBlock?: number;
}) {
  if (Object.keys(opts.contracts).length == 0)
    throw new Error("at least one contract must be specified");

  const startBlock = opts.startBlock ?? 0;
  const startHeight = Math.max(0, startBlock - 100);
  const addresses: Record<string, string | string[]> = {};
  const abis: Record<string, any> = {};

  for (const [name, contract] of Object.entries(opts.contracts)) {
    addresses[name] = contract.address;
    abis[name] = contract.abi;
  }

  const appName = opts.author === undefined ? opts.name : `${opts.author}-${opts.name}`;
  const streamName = opts.author === undefined ? opts.name : `${opts.author}.${opts.name}`;

  return new StreamingApp({
    executable: { image: "quay.io/proxima.one/streaming-app:eth-0.13.1", app: "generic-smart-contract-parser" },
    args: {
      network: opts.network,
      startBlock: startBlock,
      addresses: addresses,
      abis: abis,
      blockIdInput: true,
    },
    input: {
      default: `proxima.${opts.network}.blocks-sync.1_0?height=${startHeight}`
    },
    output: {
      default: `contracts.${streamName}.${opts.network}.logs`,
    },
    version: SemVer.parse(opts.version),
    tuningArgs: {
      batch: 500,
      readBuffer: 1000
    },
    name: `parse-${appName}`,
    requirements: {
      network: opts.network,
    },
  });
}
