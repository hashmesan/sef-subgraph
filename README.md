# Nobank Wallet Subgraph

## What it does?

Streams all the events emitted from wallet factory and wallets created by nobank wallet to graphql. Aggregate summary data, wallet addresses, and transactions found in schema.graphql

## Prereq

- Run graph node locally using docker-compore up or point to https://graph.t.hmny.io:8020/ as described in docs.harmony.one

## Deploy

```
yarn remove-local && yarn codegen && yarn build && yarn create-local && yarn deploy-local
```

## Public deployments

Queries (HTTPS) https://graph.t.hmny.io/subgraphs/name/nobank-wallet-subgraph

Subscription (WSS)  
wss://graph-ws.sefwallet.one:8001/subgraphs/name/nobank-wallet-subgraph

## Helpful links

https://thegraph.academy/developers/defining-a-subgraph/

https://docs.harmony.one/home/developers/tools/the-graph
