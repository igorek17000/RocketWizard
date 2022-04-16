import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/OwnerDashboard.module.scss";

import Alert from "../components/Alert";

function OwnerDashboard() {
  const [ownerPass, setOwnerPass] = useState(null);

  const [discountCode, setDiscountCode] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [discountEmail, setDiscountEmail] = useState(null);

  const [discountError, setDiscountError] = useState(null);
  const [discountSuccess, setDiscountSuccess] = useState(null);

  const [payoutError, setPayoutError] = useState(null);
  const [payoutSuccess, setPayoutSuccess] = useState(null);

  const [display, setDisplay] = useState(false);

  const [payouts, setPayouts] = useState([]);

  const getGreeting = () => {
    const hours = new Date().getHours();

    if (hours > 4 && hours < 12) {
      return "Good Morning!";
    } else if (hours > 12 && hours < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  };

  const submitDiscount = async () => {
    if (!discountCode || !discountAmount || !discountEmail) {
      setDiscountError("All fields are required!");
      setDiscountSuccess(null);
      return;
    }

    if (!ownerPass) {
      setDiscountError("Owner Password is required for this action!");
      return;
    }

    const res = await fetch("/api/add-discount", {
      method: "POST",
      body: JSON.stringify({
        discountCode,
        discountAmount,
        discountEmail,
        password: ownerPass,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (res.status === 200) {
      setDiscountSuccess("Successfully added to the database!");
      setDiscountError(null);
    } else {
      setDiscountError(json.msg);
      setDiscountSuccess(null);
    }
  };

  const getPayouts = async () => {
    const res = await fetch("/api/payouts");

    const json = await res.json();

    console.log(json);

    setPayouts(json);
  };

  const payoutTrader = async (name) => {
    if (!ownerPass) {
      setPayoutError("Owner Password is required for this action!");
      return;
    }

    const res = await fetch("/api/payouts", {
      method: "POST",
      body: JSON.stringify({
        name,
        password: ownerPass,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (res.status === 200) {
      setPayoutSuccess("Successfull payout!");
      setPayoutError(null);
    } else {
      setPayoutError(json.msg);
      setPayoutSuccess(null);
    }
  };

  useEffect(() => {
    let timeout;
    if (discountSuccess) {
      timeout = setTimeout(() => {
        setDiscountSuccess(null);
      }, 3000);
    } else if (discountError) {
      timeout = setTimeout(() => {
        setDiscountError(null);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [discountSuccess, discountError]);

  useEffect(() => {
    let timeout;
    if (payoutSuccess) {
      timeout = setTimeout(() => {
        setPayoutSuccess(null);
      }, 3000);
    } else if (payoutError) {
      timeout = setTimeout(() => {
        setPayoutError(null);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [payoutSuccess, payoutError]);

  const isOwner = async () => {
    const response = await fetch("/api/is-owner");

    const json = await response.json();

    if (json.isOwner) {
      setDisplay(true);
    }
  };

  useEffect(() => {
    getPayouts();
    isOwner();
  }, []);

  return (
    display && (
      <main className={styles.dashboard}>
        <Head>
          <title>Owner Dashboard | Rocket Wizard</title>
          <meta name="description" content="Make money while sleeping" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <section className={styles.ownerDashboard}>
          <div className={styles.top}>
            <h1>{getGreeting()}</h1>
          </div>
          <div className={styles.body}>
            <div className={styles.pass}>
              <h3>Owner Password</h3>
              <input
                placeholder="Secret Owner Password"
                onChange={(e) => setOwnerPass(e.target.value)}
              />
            </div>
            <div className={styles.discount}>
              <h3>Add Discount Code</h3>
              <div className={styles.inputs}>
                <input
                  placeholder="Discount Code"
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <input
                  placeholder="Discount Amount"
                  type="number"
                  onChange={(e) => setDiscountAmount(parseInt(e.target.value))}
                />
                <input
                  placeholder="Discount owner (email)"
                  type="email"
                  onChange={(e) => setDiscountEmail(e.target.value)}
                />
                <button onClick={submitDiscount}>Submit</button>
              </div>
            </div>
            {discountError && <Alert text={discountError} error={true} />}
            {discountSuccess && (
              <Alert text={discountSuccess} bgColor="#9dffaab9" />
            )}

            <div className={styles.payout}>
              <h3>Payout Traders</h3>
              <div className={styles.traders}>
                {payouts.map((payout, i) => (
                  <div className={styles.trader} key={i}>
                    <p>{payout.trader}'s payout</p>
                    <h4>${payout.payout}</h4>
                    <button onClick={() => payoutTrader(payout.trader)}>
                      Payout
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {payoutError && <Alert text={payoutError} error={true} />}
            {payoutSuccess && (
              <Alert text={payoutSuccess} bgColor="#9dffaab9" />
            )}
          </div>
        </section>
      </main>
    )
  );
}

export default OwnerDashboard;
