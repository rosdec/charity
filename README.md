# A charity/crowfunding blockchain-based system

All the logic lays in a single smart contract, for more information see this LogRocket blog post.

To better support the development there are plenty of ready to run scripts:

```shell
npm run watch
```
Will enable the hot compile and deploy of the smart contract, useful when you have plugged this smart contract in web app.

```shell
npx hardhat node && npm run deploy
```
Will launch the local hardhat node and deploy the smart contract on it.

```shell
npx hardhat node && npm run test
```
Will execute the test suite on the hardhat node. In case you want just to execute the functional test using the hardhat testing facility you can run
```shell
npx hardhat test
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
