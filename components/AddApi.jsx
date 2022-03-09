import React, { useState } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/AddApi.module.scss";

import Checkbox from "react-custom-checkbox";

import { Scrollbar } from "react-scrollbars-custom";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Oval } from "react-loader-spinner";

import RiskyTrading from "../components/RiskyTrading";

import { useSession } from "next-auth/react";

import { AiOutlineClose } from "react-icons/ai";

import Select from "react-select";

import Alert from "./Alert";

const options = [
  { value: "binance", label: "Binance" },
  { value: "okex", label: "Okx" },
  // { value: "huobi", label: "Huobi" },
  { value: "kucoin", label: "Kucoin" },
];

const customStyles = {
  control: () => ({
    // none of react-select's styles are passed to <Control />
    width: "100%",
    display: "flex",
    padding: "0.4rem 0.5rem",
    fontSize: "1rem",
  }),
  option: (provided, state) => ({
    ...provided,
    color: "black",
  }),
  menuList: (base) => ({
    ...base,

    "::-webkit-scrollbar": {
      width: "8px",
      height: "0px",
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#888",
      borderRadius: 10,
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  }),
};

function AddApi({
  open,
  handleClose,
  updateKeys = () => {},
  forceExchange = null,
  sendApiName,
  tip = false,
  risky = false,
  tier,
}) {
  const [exchange, setExchange] = useState(
    forceExchange ? { value: forceExchange } : null
  );
  const [name, setName] = useState(null);
  const [api, setApi] = useState(null);
  const [secret, setSecret] = useState(null);
  const [password, setPassword] = useState(null);
  const [multiplier, setMultiplier] = useState(1);

  const [limitedAcc, setLimitedAcc] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [passwordExchanges] = useState(["okex", "kucoin"]);

  const { data: session, status } = useSession();

  const changeExchange = (value) => {
    setExchange(value);
  };

  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const validateApi = async (apiKey) => {
    const res = await fetch("/api/validate-api", {
      method: "POST",
      body: JSON.stringify({
        apiKey,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const valid = await res.json();

    if (!valid.valid) {
      return false;
    }

    return true;
  };

  const checkValues = async () => {
    const tierAmounts = [3000, 11000, 27500];

    setLoading(true);

    if (!(exchange && name && api && secret)) {
      setError("All fields are required.");
      return false;
    } else if (passwordExchanges.includes(exchange.value) && !password) {
      setError("All fields are required.");
      return false;
    } else if (name.includes(" ")) {
      setError("Name cannot contain spaces.");
      return false;
    }

    const apiKey = {
      name,
      api,
      secret,
      apiPassword: password || null,
      exchange: exchange.value,
    };

    const isValid = await validateApi(apiKey);

    if (!isValid) {
      setError("Invalid API key.");
      return false;
    }

    const balanceResponse = await fetch("/api/get-balance", {
      method: "POST",
      body: JSON.stringify({
        apiKey,
        exists: false,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const balance = await balanceResponse.json();

    if (parseFloat(balance.balance) > tierAmounts[tier]) {
      setError(
        "Wallet balance is too high for this tier. Please select a higher tier or change your wallet balance."
      );
      return false;
    }

    setError(null);
    return true;
  };

  const handleAdd = async () => {
    const check = await checkValues();
    setLoading(false);

    if (check) {
      const key = {
        name,
        exchange: exchange.value,
        api,
        secret,
        multiplier,
        limited: limitedAcc,
      };

      if (passwordExchanges.includes(exchange.value)) {
        key.apiPassword = password;
      }

      try {
        const response = await fetch("/api/apiKeys", {
          method: "POST",
          body: JSON.stringify({
            email: session.user.email,
            key,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();

        if (!response.ok) {
          setError(json.message);
          throw new Error(json.message || "Something went wrong");
        }

        if (sendApiName) {
          sendApiName(name);
        }

        updateKeys();
        handleClose();
      } catch (error) {}
    }
  };

  if (!session)
    return (
      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
      >
        <div className={styles.box}>
          <div className={styles.closeCorner} onClick={handleClose}>
            <AiOutlineClose />
          </div>
          <h3>You are not logged in.</h3>
          <Link href="/login">
            <button>Login</button>
          </Link>
        </div>
      </Modal>
    );

  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={handleClose}
    >
      <div className={styles.box}>
        <div className={styles.closeCorner} onClick={handleClose}>
          <AiOutlineClose />
        </div>
        <h3>Add API</h3>
        <Scrollbar
          style={{
            height: "80vh",
            width: "100%",
            borderRadius: "0.7rem",
          }}
        >
          <div className={styles.content}>
            <div className={styles.inputContainer}>
              <label>Exchange</label>
              {forceExchange ? (
                <div className={styles.forceExchange}>
                  <p>{capitalize(forceExchange)}</p>
                </div>
              ) : (
                <Select
                  className={styles.select}
                  styles={customStyles}
                  options={options}
                  value={exchange}
                  onChange={changeExchange}
                />
              )}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="name">Name of the profile</label>
              <input
                id="name"
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
              />
              {tip && (
                <p className={styles.tip}>
                  {"Tip: Keep the trader's name in mind while naming your API"}
                </p>
              )}
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="api">API</label>
              <input
                id="api"
                autoComplete="off"
                onChange={(e) => setApi(e.target.value)}
              />
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="secret">Secret</label>
              <input
                id="secret"
                type="password"
                autoComplete="off"
                onChange={(e) => setSecret(e.target.value)}
              />
            </div>
            {exchange && passwordExchanges.includes(exchange.value) && (
              <div className={styles.inputContainer}>
                <label htmlFor="secret">API Password</label>
                <input
                  id="secret"
                  type="password"
                  autoComplete="off"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            {exchange && exchange.value === "binance" && (
              <Checkbox
                checked={limitedAcc}
                onChange={(val) => setLimitedAcc(val)}
                icon={
                  <div
                    style={{
                      display: "flex",
                      flex: 1,
                      backgroundColor: "#731bde",
                      alignSelf: "stretch",
                      margin: "2px",
                      borderRadius: "3px",
                    }}
                  />
                }
                labelStyle={{
                  marginTop: "0.5rem",
                  marginLeft: 15,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textAlign: "left",
                }}
                borderColor="#731bde"
                size={20}
                label={
                  <p>
                    My binance account is limited (60 Days Rule / Leverage
                    limitation)
                  </p>
                }
              />
            )}
            {risky && (
              <RiskyTrading
                sendSelected={(selected) => setMultiplier(selected)}
              />
            )}

            {error && <Alert text={error} error={true} />}

            <button onClick={loading ? () => {} : handleAdd}>
              {loading ? (
                <Oval
                  color="#731bde"
                  secondaryColor="white"
                  height={25}
                  width={25}
                />
              ) : (
                "Add"
              )}
            </button>
          </div>
        </Scrollbar>
      </div>
    </Modal>
  );
}

export default AddApi;
