# Nobank Wallet Subgraph

## What it does?

Streams events emitted from wallet factory and wallets created by nobank wallet to graphql. Aggregate summary data, wallet addresses, and transactions found in schema.graphql

## Prereq

- Run graph node locally using docker-compore up or point to https://graph.t.hmny.io:8020/ as described in docs.harmony.one

```
yarn docker-up-testnet
```

https://docs.harmony.one/home/developers/tutorials/the-graph-subgraphs/building-and-deploying-subgraph-local-node

## Deploy
- for local docker
```
yarn run-local
```

## Running Graph Node on an Macbook M1
We do not currently build native images for Macbook M1, which can lead to processes being killed due to out-of-memory errors (code 137). Based on the example docker-compose.yml is possible to rebuild the image for your M1 by running the following, then running docker-compose up as normal:
```
# Remove the original image
docker rmi graphprotocol/graph-node:latest

# Build the image
./build.sh

# Tag the newly created image
docker tag graph-node graphprotocol/graph-node:latest
```

https://github.com/graphprotocol/graph-node/tree/master/docker

## Helpful links

https://thegraph.academy/developers/defining-a-subgraph/

https://docs.harmony.one/home/developers/tools/the-graph
