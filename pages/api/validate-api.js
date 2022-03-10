const Binance = require("node-binance-api");
const schedule = require("node-schedule");
const Kucoin = require("kucoin-futures-node-api");
const Huobi = require("node-huobi-sdk");
var ccxt = require("ccxt");

import { connectToDatabase } from "../../lib/mongodb";

const REST_URL = "https://api.huobi.de.com";
const MARKET_WS = "wss://api.huobi.de.com/ws";
const ACCOUNT_WS = "wss://api.huobi.de.com/ws/v2";

async function validateBinance(apiKey) {
  const exchange = new ccxt.binance({
    apiKey: apiKey.api,
    secret: apiKey.secret,
  });

  let valid = false;

  await exchange
    .futuresBalance()
    .then((balance) => {
      valid = true;
    })
    .catch((err) => {
      valid = false;
    });

  return valid;
}

async function validateOkex(apiKey) {
  const exchange = new ccxt.okx({
    apiKey: apiKey.api,
    secret: apiKey.secret,
    password: apiKey.apiPassword,
  });

  let valid = false;

  await exchange
    .fetchBalance()
    .then((balance) => (valid = true))
    .catch((err) => (valid = false));

  return valid;
}

async function validateKucoin(apiKey) {
  const config = {
    apiKey: apiKey.api,
    secretKey: apiKey.secret,
    passphrase: apiKey.apiPassword,
    environment: "live",
  };

  const KucoinLive = new Kucoin();
  KucoinLive.init(config);

  let valid = false;

  await KucoinLive.getAccountOverview()
    .then((r) => {
      valid = true;
    })
    .catch((e) => {
      valid = false;
    });

  return valid;
}

async function validateHuobi(apiKey) {
  const hbsdk = new Huobi({
    accessKey: apiKey.api,
    secretKey: apiKey.secret,
    url: {
      rest: REST_URL,
      market_ws: MARKET_WS,
      account_ws: ACCOUNT_WS,
    },
  });

  return false;
}

async function validateApi(apiKey) {
  switch (apiKey.exchange) {
    case "binance":
      return validateBinance(apiKey);
    case "okex":
      return validateOkex(apiKey);
    case "kucoin":
      return validateKucoin(apiKey);
    case "huobi":
      return validateHuobi(apiKey);
    default:
      return false;
  }
}

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  if (req.method === "POST") {
    const { apiKey } = req.body;

    let valid = await validateApi(apiKey);

    res.json({ valid });
  } else {
    return res.status(400).json({ message: "Unsupported request method" });
  }
}
