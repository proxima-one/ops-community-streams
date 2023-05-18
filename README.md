# Proxima community streams

This repository allows you to deploy your own streaming app to the Proxima platform.
Currently, we only support the smart contract parser — the app that subscribes to your smart contract transactions and creates a stream consisting of its logs.

In order to deploy your app you have to create a pull request adding the config for your smart contract under the `/contracts/<your-github-username>/<contract-name>/` folder. The config should be a YAML file named `app.yml` with the following fields:
- `name` — the app name, equal to containing folder name. It will be used in the resulting stream id.
- `maintainer` — email address of someone we can contact in case of any problems with the stream.
- `network` — one of `eth-main`, `eth-goerli`, `polygon-main`, `polygon-mumbai`.
- `startBlock` — the block number to start parsing logs from. Usually, it is the block where the contract was deployed.
- `version` — the version to append to the stream name. Can be used to create a new stream when changing app parameters can alter produced events. For most cases it should be `0.1.0`.
- `contracts` — the mapping with all the contracts you want to parse. The key is just a convenience name and the value should be a mapping with the following properties:
  - `address` — the smart contract address;
  - `abi` — path to the file with the contract's ABI in JSON format relative to the config file.

The stream name will be formed as `contracts.<your-github-username>.<contract-name>.<network>.logs.<version.major>_<version.minor>`.

After getting our approval and merging the PR the stream will require some time to synchronize. After manual check it will be published and ready for [consumption](https://docs.proxima.one/proxima/streams/using-streams).
