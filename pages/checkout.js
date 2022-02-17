import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Checkout.module.scss";

import { BsTagFill } from "react-icons/bs";

import Checkbox from "react-custom-checkbox";
import Select from "react-select";
import countryList from "react-select-country-list";

import { useRouter } from "next/router";

function Checkout() {
  const [readTerms, setReadTerms] = useState(false);
  const [country, setCountry] = useState(null);
  const options = useMemo(() => countryList().getData(), []);

  const router = useRouter();

  const changeCountry = (value) => {
    setCountry(value);
  };

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

  const [plans] = useState([
    {
      price: 129.99,
      name: "Basic",
    },
    {
      price: 220.99,
      name: "Advanced",
    },
    {
      price: 330.99,
      name: "Professional",
    },
  ]);

  const [plan, setPlan] = useState(plans[0]);
  const [quantity, setQuantity] = useState(1);

  const [shipping] = useState(0);

  useEffect(() => {
    const id = router.query.pId;
    const quantity = router.query.q;

    if (id && quantity) {
      setPlan(plans[id] || plans[0]);
      setQuantity(quantity || 1);
    }
  }, [router]);

  return (
    <main className={styles.checkout}>
      <Head>
        <title>Checkout | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
                    <input id="name" />
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
                    <input id="address" />
                    <p>+ Add another address field (optional)</p>
                  </div>
                  <div className={styles.inputContainer}>
                    <label htmlFor="zip">
                      Postcode / ZIP<span>*</span>
                    </label>
                    <div className={styles.zipInput}>
                      {" "}
                      <input id="zip" />
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
                    <input id="email" />
                  </div>
                </section>
              </section>

              {/* ADDITIONAL */}

              <section className={styles.additional}>
                <h2>ADDITIONAL OPTIONS</h2>
                <p>+ Apply a coupon code</p>
                <label>Discount</label>
                <div className={styles.discount}>
                  <BsTagFill />
                  <input placeholder="CODE" />
                  <button>Apply</button>
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
                    <p>${plan.price}</p>
                  </div>
                  <div className={styles.item}>
                    <h4>SHIPPING</h4>
                    <p>{shipping > 0 ? "$" + shipping : "FREE SHIPPING"}</p>
                  </div>
                  <div className={styles.item}>
                    <h4>TOTAL</h4>
                    <h4 className={styles.total}>
                      ${plan.price * quantity + shipping}
                    </h4>
                  </div>
                </div>
              </section>
              {/* PAYMENT METHOD */}

              <section className={styles.payment}>
                <h2>PAYMENT METHOD</h2>
                <div className={styles.cardMethod}>
                  <div className={styles.header}>
                    <h3>Debit Credit Card</h3>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      className={styles.cardNum}
                      placeholder="Card number"
                    />
                    <div className={styles.smallInputs}>
                      <input placeholder="MM" />
                      <p>/</p>
                      <input placeholder="YY" />
                      <input className={styles.cvc} placeholder="CVC" />
                    </div>
                  </div>
                </div>
                <div className={styles.cryptoMethod}>
                  <div className={styles.header}>
                    <h3>Crypto</h3>
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
                  }}
                  borderColor="#731bde"
                  size={20}
                  label="I have read and agree to the website terms and conditions"
                />
                <p>
                  Your personal data will be used to process your order, support
                  your experience throughout this website, and for other
                  purposes described in our{" "}
                  <span>
                    <Link href="/privacy-policy">privacy policy.</Link>
                  </span>
                </p>
                <button>Place Order</button>
              </section>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Checkout;
