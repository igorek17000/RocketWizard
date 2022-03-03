import React, { useState } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/AddApi.module.scss";

import RiskyTrading from "../components/RiskyTrading";

import { useSession } from "next-auth/react";

import { AiOutlineClose } from "react-icons/ai";

import Select from "react-select";

import Alert from "./Alert";

const options = [
  { value: "binance", label: "Binance" },
  { value: "okex", label: "Okex" },
  { value: "huobi", label: "Huobi" },
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
}) {
  const [exchange, setExchange] = useState(
    forceExchange ? { value: forceExchange } : null
  );
  const [name, setName] = useState(null);
  const [api, setApi] = useState(null);
  const [secret, setSecret] = useState(null);
  const [password, setPassword] = useState(null);
  const [multiplier, setMultiplier] = useState(1);

  const [error, setError] = useState(null);

  const [passwordExchanges] = useState(["okex", "kucoin"]);

  const { data: session, status } = useSession();

  const changeExchange = (value) => {
    setExchange(value);
  };

  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const validateApi = () => {
    switch (exchange.value) {
      case "binance":
        break;
      default:
        break;
    }
    return true;
  };

  const checkValues = () => {
    if (!(exchange && name && api && secret)) {
      setError("All fields are required.");
      return false;
    } else if (passwordExchanges.includes(exchange.value) && !password) {
      setError("All fields are required.");
      return false;
    } else if (!validateApi()) {
      setError("Invalid API key.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleAdd = async () => {
    if (checkValues()) {
      const key = {
        name,
        exchange: exchange.value,
        api,
        secret,
        multiplier,
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
            autoComplete="off"
            onChange={(e) => setSecret(e.target.value)}
          />
        </div>
        {exchange && passwordExchanges.includes(exchange.value) && (
          <div className={styles.inputContainer}>
            <label htmlFor="secret">API Password</label>
            <input
              id="secret"
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
        {risky && (
          <RiskyTrading sendSelected={(selected) => setMultiplier(selected)} />
        )}
        {error && <Alert text={error} error={true} />}
        <button onClick={handleAdd}>Add</button>
      </div>
    </Modal>
  );
}

export default AddApi;
