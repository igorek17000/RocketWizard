const Binance = require("node-binance-api");
const schedule = require("node-schedule");
const Kucoin = require("kucoin-futures-node-api");
const Huobi = require("node-huobi-sdk");
const ccxt = require("ccxt");
var CryptoJS = require("crypto-js");

import { connectToDatabase } from "../../lib/mongodb";

const REST_URL = "https://api.huobi.de.com";
const MARKET_WS = "wss://api.huobi.de.com/ws";
const ACCOUNT_WS = "wss://api.huobi.de.com/ws/v2";

async function getBinance(apiKey, exists) {
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);

  const binance = new Binance().options({
    APIKEY: exists ? apiBytes.toString(CryptoJS.enc.Utf8) : apiKey.api,
    APISECRET: exists ? secretBytes.toString(CryptoJS.enc.Utf8) : apiKey.secret,
  });

  const balances = await binance.futuresBalance();

  let balance;

  try {
    balance = parseFloat(
      await balances.find((x) => x.asset === "USDT").balance
    );
  } catch {
    balance = 0;
  }

  return balance;
}

async function getOkex(apiKey, exists) {
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);
  var passwordBytes = CryptoJS.AES.decrypt(
    apiKey.apiPassword,
    process.env.cryptKey
  );

  const exchange = new ccxt.okx({
    apiKey: exists ? apiBytes.toString(CryptoJS.enc.Utf8) : apiKey.api,
    secret: exists ? secretBytes.toString(CryptoJS.enc.Utf8) : apiKey.secret,
    password: exists
      ? passwordBytes.toString(CryptoJS.enc.Utf8)
      : apiKey.apiPassword,
  });

  let balance = 0;

  await exchange
    .fetchBalance()
    .then((balanceObj) => {
      if (balanceObj.total["USDT"]) {
        balance = balanceObj.total["USDT"];
      }
    })
    .catch((e) => {});

  return balance;
}

async function getKucoin(apiKey, exists) {
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);
  var passwordBytes = CryptoJS.AES.decrypt(
    apiKey.apiPassword,
    process.env.cryptKey
  );

  const config = {
    apiKey: exists ? apiBytes.toString(CryptoJS.enc.Utf8) : apiKey.api,
    secretKey: exists ? secretBytes.toString(CryptoJS.enc.Utf8) : apiKey.secret,
    passphrase: exists
      ? passwordBytes.toString(CryptoJS.enc.Utf8)
      : apiKey.apiPassword,
    environment: "live",
  };

  const KucoinLive = new Kucoin();
  KucoinLive.init(config);

  let balance = 0;

  KucoinLive.getAccountOverview()
    .then((r) => {
      balance = r.data.availableBalance;
    })
    .catch((e) => {});

  return balance;
}

async function getHuobi(apiKey, exists) {
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);

  const hbsdk = new Huobi({
    accessKey: exists ? apiBytes.toString(CryptoJS.enc.Utf8) : apiKey.api,
    secretKey: exists ? secretBytes.toString(CryptoJS.enc.Utf8) : apiKey.secret,
    url: {
      rest: REST_URL,
      market_ws: MARKET_WS,
      account_ws: ACCOUNT_WS,
    },
  });

  let balance = 0;

  hbsdk
    .getAccountId()
    .then(() => {
      hbsdk
        .getAccountBalance()
        .then((data) => {})
        .catch((e) => {});
    })
    .catch((e) => {});

  return balance;
}

async function getBalance(apiKey, exists = false) {
  switch (apiKey.exchange) {
    case "binance":
      return getBinance(apiKey, exists);
    case "okex":
      return getOkex(apiKey, exists);
    case "kucoin":
      return getKucoin(apiKey, exists);
    case "huobi":
      return getHuobi(apiKey, exists);
    default:
      return 0;
  }
}

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { exists } = req.body;

    if (exists) {
      const { email, apiName } = req.body;

      const user = await db.collection("users").findOne({ email });

      const apiKey = await user.apiKeys.find((x) => x.name === apiName);

      let balance = await getBalance(apiKey, true);

      res.json({ balance });
    } else {
      const { apiKey } = req.body;
      let balance = await getBalance(apiKey);

      res.json({ balance });
    }
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
