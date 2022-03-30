import React, { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/ChooseApi.module.scss";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Oval } from "react-loader-spinner";

import AddApi from "./AddApi";
import Alert from "./Alert";

import { useSession } from "next-auth/react";

import { AiOutlineClose } from "react-icons/ai";

import Select from "react-select";
import RiskyTrading from "./RiskyTrading";

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
    height: "8rem",
    "::-webkit-scrollbar": {
      width: "3px",
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

function ChooseApi({ open, handleClose, traderId, sendApiName, tier }) {
  const [options, setOptions] = useState([]);

  const [api, setApi] = useState(null);
  const [addingApi, setAddingApi] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exchange, setExchange] = useState(null);
  const [secondExchange, setSecondExchange] = useState(null);

  const changeApi = (value) => {
    setApi(value);
  };

  const addApi = () => {
    setAddingApi(true);
    handleClose();
  };

  const [error, setError] = useState(null);

  const { data: session, status } = useSession();

  const handleChoose = async () => {
    const tierAmounts = [3000, 11000, 27500];

    if (api) {
      const balanceResponse = await fetch("/api/get-balance", {
        method: "POST",
        body: JSON.stringify({
          email: session.user.email,
          apiName: api.value,
          exists: true,
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
        return;
      }

      sendApiName(api.value);

      handleClose();
    }
  };

  const getExchange = async () => {
    const res = await fetch(
      `https://rocketwizard.io/api/get-exchange?traderId=${traderId}`
    );

    const json = await res.json();

    setExchange(json.exchange);
    setSecondExchange(json.secondExchange);

    return {
      exchangeOne: json.exchange,
      exchangeTwo: json.secondExchange,
    };
  };

  const getAPIs = async () => {
    const { exchangeOne, exchangeTwo } = await getExchange();

    const res = await fetch(`https://rocketwizard.io/api/apiKeys`);

    const keys = await res.json();

    let tempOptions = [];
    let count = 0;

    for await (const key of keys) {
      if (
        (key.exchange === exchangeOne || key.exchange === exchangeTwo) &&
        !key.taken
      ) {
        count++;
        tempOptions.push({
          value: key.name,
          label: key.name,
        });
      }
    }

    if (count === 0) {
      setAddingApi(true);
      handleClose();
      setLoading(false);
    }

    setOptions(tempOptions);
  };

  const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    options.length !== 0 && setLoading(false);
  }, [options]);

  useEffect(() => {
    open && getAPIs();
  }, [open]);

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
    <>
      {exchange && (
        <AddApi
          open={addingApi}
          handleClose={() => {
            setAddingApi(false);
            handleClose();
          }}
          forceExchange={exchange}
          forceSecondExchange={secondExchange}
          sendApiName={(name) => sendApiName(name)}
          tip={true}
          tier={tier}
          risky={true}
        />
      )}

      <Modal
        aria-labelledby="unstyled-modal-title"
        aria-describedby="unstyled-modal-description"
        open={open}
        onClose={handleClose}
      >
        {loading ? (
          <div className={styles.box}>
            <Oval
              color="#731bde"
              secondaryColor="#a879e0"
              height={80}
              width={80}
            />
          </div>
        ) : (
          <div className={styles.box}>
            <div className={styles.closeCorner} onClick={handleClose}>
              <AiOutlineClose />
            </div>
            <h3>Choose API</h3>
            <div className={styles.inputContainer}>
              <label>
                {`Your ${capitalize(exchange)} ${
                  secondExchange ? `or ${capitalize(secondExchange)} ` : ""
                } APIs`}
              </label>
              <Select
                className={styles.select}
                styles={customStyles}
                options={options}
                value={api}
                onChange={changeApi}
                isSearchable={false}
              />
            </div>
            <p>
              Or <span onClick={addApi}>Create a new one</span>
            </p>
            <RiskyTrading />
            {error && <Alert text={error} error={true} />}
            <button onClick={handleChoose}>Continue</button>
          </div>
        )}
      </Modal>
    </>
  );
}

export default ChooseApi;
