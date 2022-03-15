const Binance = require("node-binance-api");
const schedule = require("node-schedule");
const Kucoin = require("kucoin-futures-node-api");
const Huobi = require("node-huobi-sdk");
var ccxt = require("ccxt");
var CryptoJS = require("crypto-js");

import { connectToDatabase } from "../../lib/mongodb";

const REST_URL = "https://api.huobi.de.com";
const MARKET_WS = "wss://api.huobi.de.com/ws";
const ACCOUNT_WS = "wss://api.huobi.de.com/ws/v2";

async function validateBinance(apiKey) {
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);

  const binance = new Binance().options({
    APIKEY: apiBytes.toString(CryptoJS.enc.Utf8),
    APISECRET: secretBytes.toString(CryptoJS.enc.Utf8),
  });

  const balances = await binance.futuresBalance();

  if (balances.code) {
    return false;
  } else {
    return true;
  }
}

async function validateOkex(apiKey) {
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);
  var passwordBytes = CryptoJS.AES.decrypt(
    apiKey.apiPassword,
    process.env.cryptKey
  );

  const exchange = new ccxt.okx({
    apiKey: apiBytes.toString(CryptoJS.enc.Utf8),
    secret: secretBytes.toString(CryptoJS.enc.Utf8),
    password: passwordBytes.toString(CryptoJS.enc.Utf8),
  });

  let valid = false;

  await exchange
    .fetchBalance()
    .then((balance) => (valid = true))
    .catch((err) => (valid = false));

  return valid;
}

async function validateKucoin(apiKey) {
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);
  var passwordBytes = CryptoJS.AES.decrypt(
    apiKey.apiPassword,
    process.env.cryptKey
  );

  const config = {
    apiKey: apiBytes.toString(CryptoJS.enc.Utf8),
    secretKey: secretBytes.toString(CryptoJS.enc.Utf8),
    passphrase: passwordBytes.toString(CryptoJS.enc.Utf8),
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
  var apiBytes = CryptoJS.AES.decrypt(apiKey.api, process.env.cryptKey);
  var secretBytes = CryptoJS.AES.decrypt(apiKey.secret, process.env.cryptKey);

  const hbsdk = new Huobi({
    accessKey: apiBytes.toString(CryptoJS.enc.Utf8),
    secretKey: secretBytes.toString(CryptoJS.enc.Utf8),
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
