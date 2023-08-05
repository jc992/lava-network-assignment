# Lava Network Assignment
Lava Protocol is a decentralized RPC access infrastructure that in a nutshell gives developers an environment to interact with rpc providers for different chains. After the developer is paired with providers and passes relays, the provider reports about the work that was done back to the blockchain and ask for payment.  
This is a web-app that shows the top 10 chains on lava by the number of relays pass in Lava Blockchain in the last 20 blocks.  
There might be instances where the last 20 blocks don't actually contain any relevant messages in their transactions, and in this case we don't render a table with this information, but keep listening in for incoming blocks.  
[MsgRelayPayment](https://github.com/lavanet/lava/blob/dbea6bf998a32e9108b7221b924cab78652de37e/proto/pairing/tx.proto#L63) is the relevant message we listen for in transactions. 

## Getting Started
```
yarn install
```
OR
```
npm run install
```
To install project dependencies

## Run Application
```
yarn dev
```
OR
```
npm run dev
```
To start up the project in development environment

## Build Application
```
yarn build
```
OR
```
npm run build
```
To build production bundle of the project  
Check out [Vite build guide](https://vitejs.dev/guide/build.html) for more details

## Deployment
Check out [Vite deploy guide](https://vitejs.dev/guide/static-deploy.html) for instructions on how to deploy a Vite application

## Participate
In case you feel like making an improvement on the existing code, feel free to checkout `develop` and create a Pull Request with the suggested changes, an informative branch name, and a description with the changes taking place.
