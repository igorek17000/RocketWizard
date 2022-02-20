import React, { useState } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/AddApi.module.scss";

import Binance from "binance-api-node";

import { useSession } from "next-auth/react";

import { AiOutlineClose } from "react-icons/ai";

import Select from "react-select";

import Alert from "./Alert";

const options = [
  { value: "binance", label: "Binance" },
  { value: "okex", label: "Okex" },
  { value: "ftx", label: "Ftx" },
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

function AddApi({ open, handleClose, updateKeys }) {
  const [exchange, setExchange] = useState(null);
  const [name, setName] = useState(null);
  const [api, setApi] = useState(null);
  const [secret, setSecret] = useState(null);

  const [error, setError] = useState(null);

  const { data: session, status } = useSession();

  const changeExchange = (value) => {
    setExchange(value);
  };

  const validateBinanceApi = async () => {
    const client = Binance({
      apiKey: api,
      apiSecret: secret,
    });

    await new Promise((res) => res(false));
  };

  const validateApi = () => {
    if (exchange.value === "binance") {
      validateBinanceApi().then((validated) => {
        return validated;
      });
    }
  };

  const checkValues = () => {
    if (!(exchange && name && api && secret)) {
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
      };

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

        console.log(json);

        if (!response.ok) {
          setConfirmPasswordError(json.message);
          throw new Error(json.message || "Something went wrong");
        }
        updateKeys();
        handleClose();
      } catch (error) {}
    }
  };

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
          <Select
            className={styles.select}
            styles={customStyles}
            options={options}
            value={exchange}
            onChange={changeExchange}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="name">Name of the profile</label>
          <input
            id="name"
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
          />
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
        {error && <Alert text={error} error={true} />}
        <button onClick={handleAdd}>Add</button>
      </div>
    </Modal>
  );
}

export default AddApi;
