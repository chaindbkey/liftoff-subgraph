const loadJsonFile = require("load-json-file");
const keys = loadJsonFile.sync("./keys.json");

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*"
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          keys.privateKey,
          `wss://ropsten.infura.io/ws/v3/${keys.infuraKey}`
        );
      },
      network_id: "3"
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(
          keys.privateKey,
          `wss://mainnet.infura.io/ws/v3/${keys.infuraKey}`
        );
      },
      network_id: "1"
    }
  },
  compilers: {
    solc: {
      version: "0.6.6"
    }
  }
};
