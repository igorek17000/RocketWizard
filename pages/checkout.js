import React, { useState, useMemo, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import styles from "../styles/Checkout.module.scss";

import { useSession } from "next-auth/react";

import { BsTagFill } from "react-icons/bs";

import Checkbox from "react-custom-checkbox";
import Select from "react-select";
import countryList from "react-select-country-list";

import { useRouter } from "next/router";

import Alert from "../components/Alert";

import ChooseApi from "../components/ChooseApi";

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

function Checkout({ traders, NPApi }) {
  const npApi = new NowPaymentsApi({ apiKey: NPApi });

  const [readTerms, setReadTerms] = useState(false);

  const [country, setCountry] = useState(null);
  const [crypto, setCrypto] = useState(null);

  const [choosingApi, setChoosingApi] = useState(false);

  const [name, setName] = useState(null);
  const [streetAddress, setStreetAddress] = useState(null);
  const [secondStreetAddress, setSecondStreetAddress] = useState(null);
  const [zip, setZip] = useState(null);
  const [email, setEmail] = useState(null);
  const [discountCode, setDiscountCode] = useState(null);
  const [discount, setDiscount] = useState(0);

  const [secondAddressActivated, setSecondAddressActivated] = useState(false);

  const codeRef = useRef(null);

  const options = useMemo(() => countryList().getData(), []);

  const { data: session, status } = useSession();

  const router = useRouter();

  const changeCrypto = (value) => {
    setCrypto(value);
  };

  const changeCountry = (value) => {
    setCountry(value);
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

  const [id, setId] = useState(0);
  const [plan, setPlan] = useState(plans[0]);
  const [traderId, setTraderId] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const [shipping] = useState(0);

  useEffect(() => {
    const id = router.query.p;
    const quantity = router.query.q;
    const traderId = router.query.t;

    if (id && quantity && traderId) {
      setId(id);
      setPlan(plans[id] || plans[0]);
      setQuantity(parseInt(quantity) || 1);
      setTraderId(traderId);
    }
  }, [router]);

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
        priceMultipliers[id] * (trader.basePrice * priceMultipliers[id - 1]);
    }

    const planPriceTemp = Math.max(
      centRound(price * quantity),
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
  const [success, setSuccess] = useState(null);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const getOrderID = async (apiName) => {
    return `${traderId} ${plan.name} ${quantity} ${
      session.user.email
    } ${apiName} ${discountCode ? discountCode : "false"}`;
  };

  const pay = async (apiName) => {
    const orderId = await getOrderID(apiName);

    const config = {
      price_amount: fullPrice,
      price_currency: "usd",
      pay_currency: crypto.value,
      order_description: `${plan.name} x ${quantity}`,
      order_id: orderId,
      success_url: "https://rocketwizard.io/?orderSuccess=true",
      cancel_url: "https://rocketwizard.io/checkout/fail",
      ipn_callback_url: "https://rocketwizard.io/api/payment",
    };

    const invoice = await npApi.createInvoice(config);

    router.replace(invoice.invoice_url);

    setName(null);
    setStreetAddress(null);
    setSecondStreetAddress(null);
    setZip(null);
    setEmail(null);
    setDiscountCode(null);
    setDiscount(0);
    setCountry(null);
    setCrypto(null);

    return true;
  };

  const checkValues = (apiName) => {
    setSuccess(null);

    if (!(name && streetAddress && zip && email && country)) {
      setMainError("Please fill out required fields");
      return false;
    } else if (!validateEmail(email)) {
      setMainError("Invalid Email");
      return false;
    } else if (!readTerms) {
      setMainError(
        "Please agree to terms and conditions before placing the order."
      );
      return false;
    } else if (!crypto || fullPrice == null) {
      setMainError("Payment info is required.");
      return false;
    }

    setMainError(null);
    setChoosingApi(true);
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

  return (
    <main className={styles.checkout}>
      <Script src="https://unpkg.com/@nowpaymentsio/nowpayments-api-js/dist/nowpayments-api-js.min.js"></Script>
      <Head>
        <title>Checkout | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ChooseApi
        open={choosingApi}
        handleClose={() => setChoosingApi(false)}
        traderId={traderId}
        tier={id}
        sendApiName={(apiName) => pay(apiName)}
      />
      <section className={styles.card}>
        <div className={styles.header}>
          <h1>Checkout</h1>
        </div>
        <div className={styles.body}>
          <div className={styles.returnMsg}>
            <p>
              You want to return?{" "}
              <span onClick={() => router.back()}>Click here to go back</span>
            </p>
          </div>
          <div className={styles.content}>
            {/* SHIPPING AND CONTACT AND ADDITIONAL */}

            <section className={styles.shippingContactAdditional}>
              {/* SHIPPING AND CONTACT */}

              <section className={styles.shippingAndContact}>
                {/* SHIPPING */}

                <section className={styles.shipping}>
                  <h2>SHIPPING DETAILS</h2>
                  <p>
                    <span>*</span>required fields
                  </p>
                  <div className={styles.inputContainer}>
                    <label htmlFor="name">
                      Full Name<span>*</span>
                    </label>
                    <input
                      id="name"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputContainer}>
                    <label htmlFor="country">
                      Country<span>*</span>
                    </label>
                    <Select
                      className={styles.select}
                      styles={customStyles}
                      options={options}
                      value={country}
                      onChange={changeCountry}
                    />
                  </div>
                  <div className={styles.inputContainer}>
                    <label htmlFor="address">
                      Street Address<span>*</span>
                    </label>
                    <input
                      id="address"
                      onChange={(e) => setStreetAddress(e.target.value)}
                    />
                    {!secondAddressActivated ? (
                      <p
                        style={{ cursor: "pointer" }}
                        onClick={() => setSecondAddressActivated(true)}
                      >
                        + Add another address field (optional)
                      </p>
                    ) : (
                      <>
                        <input
                          id="secondAddress"
                          onChange={(e) =>
                            setSecondStreetAddress(e.target.value)
                          }
                        />
                        <p
                          style={{ cursor: "pointer" }}
                          onClick={() => setSecondAddressActivated(false)}
                        >
                          - Remove another address field
                        </p>
                      </>
                    )}
                  </div>
                  <div className={styles.inputContainer}>
                    <label htmlFor="zip">
                      Postcode / ZIP<span>*</span>
                    </label>
                    <div className={styles.zipInput}>
                      {" "}
                      <input
                        id="zip"
                        onChange={(e) => setZip(e.target.value)}
                      />
                      <p>Enter ZIP for City & State</p>
                    </div>
                  </div>
                </section>
                {/* CONTACT */}

                <section className={styles.contact}>
                  <h2>CONTACT INFORMATION</h2>
                  <div className={styles.inputContainer}>
                    <label htmlFor="email">
                      Email<span>*</span>
                    </label>
                    <input
                      id="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </section>
              </section>

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
                </div>
              </section>
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
                <button onClick={checkValues}>Place Order</button>
                {success && <Alert text={success} bgColor="#9dffaab9" />}
              </section>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export async function getServerSideProps() {
  const res = await fetch(`https://rocketwizard.io/api/traders`);

  const traders = await res.json();

  // Pass data to the page via props
  return { props: { traders, NPApi: process.env.NPapi } };
}

export default Checkout;
