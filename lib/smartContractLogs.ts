import { Network, SemVer, StreamingApp } from "@proxima-one/pulumi-service-apps";

export interface SmartContract {
  abi: any;
  address: string | string[];
}

export function smartContractLogs(opts: {
  name: string,
  network: Network,
  contracts: Record<string, SmartContract>,
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

  return new StreamingApp({
    executable: { image: "quay.io/proxima.one/streaming-app:eth-0.13.0", app: "generic-smart-contract-parser" },
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
      default: `contracts.${opts.name}.${opts.network}.logs`,
    },
    version: SemVer.parse("0.1.0"),
    tuningArgs: {
      batch: 50,
    },
    name: `contracts-${opts.name}-${opts.network}`,
    requirements: {
      network: opts.network,
    },
  });
}
