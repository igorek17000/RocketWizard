import React, { useState, useMemo, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import styles from "../styles/Renew.module.scss";

import Modal from "@material-ui/core/Modal";

import { useSession } from "next-auth/react";

import { BsTagFill } from "react-icons/bs";

import Checkbox from "react-custom-checkbox";
import Select from "react-select";
import { Scrollbar } from "react-scrollbars-custom";

import { useRouter } from "next/router";

import Alert from "../components/Alert";

import NowPaymentsApi from "@nowpaymentsio/nowpayments-api-js";

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

const customStylesCrypto = {
  control: () => ({
    // none of react-select's styles are passed to <Control />
    width: "100%",
    display: "flex",
    padding: "0.1rem",
    fontSize: "0.9rem",
    backgroundColor: "white",
    borderRadius: 5,
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

const cryptoOptions = [
  {
    value: "btc",
    label: "BTC",
  },
  {
    value: "eth",
    label: "ETH",
  },
  {
    value: "usdttrc20",
    label: "USDTTRC20",
  },
  {
    value: "ltc",
    label: "LTC",
  },
  {
    value: "doge",
    label: "DOGE",
  },
  {
    value: "xmr",
    label: "XMR",
  },
];

let originalMonthOptions = [
  {
    value: 1,
    label: "1 month",
    addOne: false,
  },
  {
    value: 2,
    label: "2 months",
    addOne: false,
  },
  {
    value: 3,
    label: "3 months",
    addOne: false,
  },
];

function Renew({
  traders,
  open,
  handleClose,
  id = 0,
  quan = 1,
  traderId,
  apiName,
}) {
  const [readTerms, setReadTerms] = useState(false);

  const [monthOptions, setMonthOptions] = useState(originalMonthOptions);

  const [crypto, setCrypto] = useState(null);
  const [month, setMonth] = useState({
    value: 1,
    label: "1 month",
  });

  const [discountCode, setDiscountCode] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [quantity, setQuantity] = useState(quan);

  const changeMonths = (value) => {
    setMonth(value);

    setQuantity(value.value);
  };

  const getMonthDeals = async () => {
    if (!session) return;
    const dealsRes = await fetch(`${process.env.DEV_URL}api/month-deals`);

    const monthsJson = await dealsRes.json();

    setMonthOptions(monthsJson);
  };

  const codeRef = useRef(null);

  const { data: session, status } = useSession();

  const router = useRouter();

  const changeCrypto = (value) => {
    setCrypto(value);
  };

  const [plans] = useState([
    {
      id: 0,
      name: "Basic",
    },
    {
      id: 1,
      name: "Advanced",
    },
    {
      id: 2,
      name: "Professional",
    },
  ]);

  const [plan, setPlan] = useState(plans[id]);

  const [shipping] = useState(0);

  const centRound = (val) => {
    if (val % 10 > 6 || val % 10 === 0) {
      return Math.ceil(val / 10) * 10 - 0.01;
    } else {
      return Math.floor(val / 10) * 10 + 5.99;
    }
  };

  const [priceMultipliers] = useState([1, 1.6, 1.75]);

  const [fullPrice, setFullPrice] = useState(0);
  const [planPrice, setPlanPrice] = useState(0);

  const getPrice = async () => {
    if (!traders) return 0;

    const trader = await traders.find((trader) => trader.id == traderId);

    let price = trader ? trader.basePrice : 0;

    if (parseInt(id) !== 0) {
      price =
        priceMultipliers[id] *
        centRound(trader.basePrice * priceMultipliers[id - 1]);
    }

    let quanTemp = quantity;

    if (month.addOne) {
      quanTemp--;
    }

    const planPriceTemp = Math.max(
      centRound(centRound(price) * quanTemp),
      0
    ).toLocaleString("en-US");

    setPlanPrice(centRound(planPriceTemp));

    const fullPriceTemp =
      Math.floor(Math.max(planPriceTemp + shipping - discount, 0)) + 0.99;

    setFullPrice(fullPriceTemp);
  };

  const [mainError, setMainError] = useState(null);
  const [codeError, setCodeError] = useState(null);
  const [codeSuccess, setCodeSuccess] = useState(null);

  const getOrderID = async () => {
    return `${traderId} ${plan.name} ${quantity} ${
      session.user.email
    } ${apiName} ${discountCode ? discountCode : "false"} ${
      month.id ? month.id : "0"
    }`;
  };

  const checkValues = async () => {
    if (!readTerms) {
      setMainError(
        "Please agree to terms and conditions before placing the order."
      );
      return false;
    } else if (!crypto || fullPrice == null) {
      setMainError("Payment info is required.");
      return false;
    }
    setMainError(null);

    const orderId = await getOrderID();

    const res = await fetch("/api/create-payment", {
      method: "POST",
      body: JSON.stringify({
        tier: id,
        traderId: traderId,
        discountCode: discountCode || null,
        currency: crypto.value,
        description: `${plan.name} x ${quantity}`,
        orderId,
        quantity,
        addOne: month.addOne,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    router.replace(json.url);

    setDiscountCode(null);
    setDiscount(0);
    setCrypto(null);

    return true;
  };

  const applyDiscountCode = async () => {
    let code = codeRef.current.value.toUpperCase();

    setDiscountCode(code);

    try {
      const response = await fetch("/api/discountCode", {
        method: "POST",
        body: JSON.stringify({
          code,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      if (!response.ok) {
        setCodeError(json.msg);
        setCodeSuccess(null);
        throw new Error(json.msg || "Something went wrong");
      } else {
        setCodeError(null);
        setDiscount(Math.round(fullPrice * (json.discount / 100) * 100) / 100);
        setCodeSuccess(
          `Your code was entered successfully and you saved ${json.discount}%!`
        );
      }
    } catch (error) {}
  };

  const removeDiscountCode = () => {
    setDiscountCode(null);
    setDiscount(0);
    setCodeError(null);
    setCodeSuccess(null);
  };

  useEffect(() => {
    getPrice();
  }, [discount, quantity, id, plan]);

  useEffect(() => {
    getPrice();
  }, []);

  useEffect(() => {
    getMonthDeals();
  }, [router]);

  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={handleClose}
    >
      <section className={styles.card}>
        <Script src="https://unpkg.com/@nowpaymentsio/nowpayments-api-js/dist/nowpayments-api-js.min.js"></Script>
        <div className={styles.header}>
          <h1>Renew</h1>
        </div>
        <Scrollbar style={{ height: "70vh", borderRadius: "0.7rem" }}>
          <div className={styles.body}>
            {/* ADDITIONAL */}

            <section className={styles.additional}>
              <h2>ADDITIONAL OPTIONS</h2>
              <p>+ Apply a coupon code</p>
              <div className={styles.codeAndError}>
                <label>Discount</label>
                <div className={styles.discount}>
                  <BsTagFill />
                  <input
                    placeholder="CODE"
                    ref={codeRef}
                    readOnly={discount > 0}
                  />
                  {discount > 0 ? (
                    <button
                      onClick={removeDiscountCode}
                      className={styles.remove}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyDiscountCode}
                      className={styles.apply}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {codeError && <Alert text={codeError} error={true} />}
                {codeSuccess && (
                  <Alert text={codeSuccess} bgColor="#9dffaab9" />
                )}
                <div className={styles.months}>
                  <label>Months</label>
                  <Select
                    className={styles.select}
                    styles={customStylesCrypto}
                    options={monthOptions}
                    value={month}
                    onChange={changeMonths}
                    isSearchable={false}
                  />
                </div>
              </div>
            </section>

            {/* ORDER AND PAYMENT */}

            <section className={styles.orderAndPayment}>
              {/* YOUR ORDER */}

              <section className={styles.order}>
                <h2>YOUR ORDER</h2>
                <div className={styles.list}>
                  <div className={styles.item}>
                    <h3>PRODUCT</h3>
                    <h3>TOTAL</h3>
                  </div>
                  <div className={styles.item}>
                    <h4>
                      {plan.name} x {quantity}
                    </h4>
                    <p>${planPrice}</p>
                  </div>
                  <div className={styles.item}>
                    <h4>SHIPPING</h4>
                    <p>{shipping > 0 ? "$" + shipping : "FREE SHIPPING"}</p>
                  </div>
                  {discount > 0 && (
                    <div className={styles.item}>
                      <h4>DISCOUNT CODE ({discountCode})</h4>
                      <p>-${discount}</p>
                    </div>
                  )}

                  <div className={styles.item}>
                    <h4>TOTAL</h4>
                    <h4 className={styles.total}>
                      ${Math.round(fullPrice * 100) / 100}
                    </h4>
                  </div>
                </div>
              </section>
              {/* PAYMENT METHOD */}

              <section className={styles.payment}>
                <h2>PAYMENT METHOD</h2>

                <div className={styles.cryptoMethod}>
                  <div className={styles.header}>
                    <Select
                      className={styles.select}
                      styles={customStylesCrypto}
                      options={cryptoOptions}
                      value={crypto}
                      onChange={changeCrypto}
                      isSearchable={false}
                      placeholder="Crypto"
                    />
                    <img src="/images/checkout/coins.svg" alt="Crypto coins" />
                  </div>
                  <div className={styles.body}>
                    <p>
                      {
                        "You can pay with crypto if you don't have a debit or a credit card"
                      }
                    </p>
                  </div>
                </div>
                <Checkbox
                  checked={readTerms}
                  onChange={(val) => setReadTerms(val)}
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
                    marginLeft: 15,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textAlign: "left",
                  }}
                  borderColor="#731bde"
                  size={20}
                  label={
                    <p>
                      I have read and agree to the website{" "}
                      <Link href="/terms-and-conditions">
                        terms and conditions
                      </Link>
                    </p>
                  }
                />
                <p>
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other
                  purposes described in our{" "}
                  <span>
                    <Link href="/privacy-policy">privacy policy.</Link>
                  </span>
                </p>
                {mainError && <Alert text={mainError} error={true} />}
                <button onClick={checkValues}>Renew</button>
              </section>
            </section>
          </div>
        </Scrollbar>
      </section>
    </Modal>
  );
}

export default Renew;
