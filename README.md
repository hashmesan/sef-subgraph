# Sef Wallet Subgraph

## What it does?

Streams all the events emitted from wallet factory and wallets created by sef wallet to graphql.  Aggregate summary data, wallet addresses, and transactions found in schema.graphql

## Prereq

* Run graph node locally using docker-compore up or point to https://graph.t.hmny.io:8020/ as described in docs.harmony.one

## Deploy

```
yarn remove-local && yarn codegen && yarn build && yarn create-local && yarn deploy-local
```
