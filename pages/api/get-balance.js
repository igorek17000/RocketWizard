const Binance = require("node-binance-api");
const schedule = require("node-schedule");
const Kucoin = require("kucoin-futures-node-api");
const Huobi = require("node-huobi-sdk");
const ccxt = require("ccxt");

import { connectToDatabase } from "../../lib/mongodb";

const REST_URL = "https://api.huobi.de.com";
const MARKET_WS = "wss://api.huobi.de.com/ws";
const ACCOUNT_WS = "wss://api.huobi.de.com/ws/v2";

async function getBinance(apiKey) {
  const binance = new Binance().options({
    APIKEY: apiKey.api,
    APISECRET: apiKey.secret,
  });

  const balances = await binance.futuresBalance();

  const balance = parseFloat(
    await balances.find((x) => x.asset === "USDT").balance
  );

  return balance;
}

async function getOkex(apiKey) {
  const exchange = new ccxt.okx({
    apiKey: apiKey.api,
    secret: apiKey.secret,
    password: apiKey.apiPassword,
  });

  let balance = 0;

  await exchange
    .fetchBalance()
    .then((balanceObj) => (balance = balanceObj.total["USDT"]))
    .catch((e) => {});

  return balance;
}

async function getKucoin(apiKey) {
  const config = {
    apiKey: apiKey.api,
    secretKey: apiKey.secret,
    passphrase: apiKey.apiPassword,
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

async function getHuobi(apiKey) {
  const hbsdk = new Huobi({
    accessKey: apiKey.api,
    secretKey: apiKey.secret,
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

async function getBalance(apiKey) {
  switch (apiKey.exchange) {
    case "binance":
      return getBinance(apiKey);
    case "okex":
      return getOkex(apiKey);
    case "kucoin":
      return getKucoin(apiKey);
    case "huobi":
      return getHuobi(apiKey);
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

      let balance = await getBalance(apiKey);

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
