import { createSchema as S, TsjsonParser, Validated } from "ts-json-validator"

const schema = S({
  type: "object",
  properties: {
    "name": S({type: "string"}),
    "version": S({type: "string", pattern: "^[0-9]+\\.[0-9]+\\.[0-9]+$"}),
    "network": S({
      type: "string",
      enum: ["eth-main", "eth-goerli", "polygon-main", "polygon-mumbai"] as const
    }),
    "startBlock": S({type: "number"}),
    "contracts": S({
      type: "object",
      patternProperties: {
        "^[a-z0-9]+$": S({
          type: "object",
          properties: {
            "address": S({
              anyOf: [
                S({type: "string"}),
                S({type: "array", items: S({type: "string"})})
              ]
            }),
            "abi": S({type: "string"})
          }
        })
      }
    }),
  },
  required: ["name", "network", "contracts", "version"]
});

export const appParser = new TsjsonParser(schema);

