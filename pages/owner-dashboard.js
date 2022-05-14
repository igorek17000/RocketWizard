import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/OwnerDashboard.module.scss";

import { Oval } from "react-loader-spinner";

import Alert from "../components/Alert";
import StatisticsCard from "../components/Dashboard/StatisticsCard";

function OwnerDashboard() {
  const [ownerPass, setOwnerPass] = useState(null);

  const [discountCode, setDiscountCode] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(null);
  const [discountEmail, setDiscountEmail] = useState(null);
  const [commission, setCommission] = useState(null);

  const [discountError, setDiscountError] = useState(null);
  const [discountSuccess, setDiscountSuccess] = useState(null);

  const [payoutError, setPayoutError] = useState(null);
  const [payoutSuccess, setPayoutSuccess] = useState(null);

  const [deductError, setDeductError] = useState(null);
  const [deductSuccess, setDeductSuccess] = useState(null);

  const [display, setDisplay] = useState(false);

  const [payouts, setPayouts] = useState([]);

  const [priceMultipliers] = useState([1, 1.6, 1.75]);
  const [data, setData] = useState(null);
  const [allEarnings, setAllEarnings] = useState(0);
  const [handled, setHandled] = useState(0);

  const [traderDeductions, setTraderDeductions] = useState({});

  const beautifyMoney = (x) => {
    let rounded = Math.round(x * 100) / 100;

    return rounded.toLocaleString("en-US");
  };

  const getDiff = (dateParam) => {
    const now = new Date();
    const date = new Date(dateParam);

    return Math.floor(Math.abs(now - date) / 36e5);
  };

  const getPrice = (basePrice, id) => {
    let price = basePrice;

    if (id !== 0) {
      price = priceMultipliers[id] * (basePrice * priceMultipliers[id - 1]);
    }

    return price;
  };

  const getData = async () => {
    const earningsRes = await fetch(
      "https://www.rocketwizard.io/api/get-earnings"
    );
    const tradersRes = await fetch(
      "https://www.rocketwizard.io/api/get-trader-ids"
    );
    const handleRes = await fetch(
      "https://www.rocketwizard.io/api/get-handled"
    );

    const traderIDs = await tradersRes.json();
    const handledAmount = await handleRes.json();
    const earnings = await earningsRes.json();

    setHandled(beautifyMoney(handledAmount.sum));

    const tempData = {
      daily: new Array(24).fill(0),
      weekly: new Array(14).fill(0),
      monthly: new Array(30).fill(0),
    };

    let sum = 0;

    for await (const traderID of traderIDs) {
      const res = await fetch(
        `https://www.rocketwizard.io/api/get-trader?id=${traderID}`
      );

      const trader = await res.json();

      if (trader.subscribers) {
        for await (const subscriber of trader.subscribers) {
          const diff = getDiff(subscriber.startDate);

          if (diff < 24) {
            const index = Math.round(24 - diff);
            tempData.daily[index - 1] = tempData.daily[index - 1] + 1;
          }
          if (diff < 24 * 7) {
            const index = 14 - Math.round(diff / 12);
            tempData.weekly[index - 1] = tempData.weekly[index - 1] + 1;
          }
          if (diff < 24 * 30) {
            const index = 30 - Math.round(diff / 24);
            tempData.monthly[index - 1] = tempData.monthly[index - 1] + 1;
          }
        }
      }

      for (const [i, tier] of trader.allTimeSubs.entries()) {
        sum += getPrice(trader.basePrice, tier);
      }
    }

    setAllEarnings(beautifyMoney(earnings.all));
    setData(tempData);
  };

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
    if (!discountCode || !discountAmount || !discountEmail || !commission) {
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
        commission,
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

  const updateDeductions = async (trader, e) => {
    let val = parseFloat(e.target.value);

    console.log(val, trader);

    let tempDeductions = traderDeductions;

    tempDeductions[trader] = val;

    setTraderDeductions(tempDeductions);

    console.log(traderDeductions);
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
      setPayoutSuccess("Successful payout!");
      setPayoutError(null);
    } else {
      setPayoutError(json.msg);
      setPayoutSuccess(null);
    }
  };

  const deductTrader = async (name) => {
    if (!ownerPass) {
      setDeductError("Owner Password is required for this action!");
      return;
    }

    let deduction = traderDeductions[name];

    const res = await fetch("/api/deduct", {
      method: "POST",
      body: JSON.stringify({
        name,
        password: ownerPass,
        deduction,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    if (res.status === 200) {
      setDeductSuccess("Successful deduction update!");
      setDeductError(null);
    } else {
      setDeductError(json.msg);
      setDeductSuccess(null);
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

  useEffect(() => {
    let timeout;
    if (deductSuccess) {
      timeout = setTimeout(() => {
        setDeductSuccess(null);
      }, 3000);
    } else if (deductError) {
      timeout = setTimeout(() => {
        setDeductError(null);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [deductSuccess, deductError]);

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
    getData();
  }, []);

  return !data ? (
    <section className={styles.traderDashboard}>
      <Oval color="#731bde" secondaryColor="#a879e0" height={80} width={80} />
    </section>
  ) : (
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
                placeholder="Owner Password"
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
                  placeholder="Discount %"
                  type="number"
                  onChange={(e) => setDiscountAmount(parseInt(e.target.value))}
                />
                <input
                  placeholder="Commission %"
                  type="number"
                  onChange={(e) => setCommission(parseInt(e.target.value))}
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
                    <p>
                      {payout.trader}
                      {"'s"} payout
                    </p>
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

            <div className={styles.payout}>
              <h3>Trader Deductions</h3>
              <div className={styles.traders}>
                {payouts.map((payout, i) => (
                  <div className={styles.trader} key={i}>
                    <p>
                      {payout.trader}
                      {"'s"} deduction
                    </p>
                    <input
                      type="number"
                      placeholder={(payout.deduction || 0) + "%"}
                      onChange={(e) => updateDeductions(payout.trader, e)}
                    />
                    <button onClick={() => deductTrader(payout.trader)}>
                      Update
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {deductError && <Alert text={deductError} error={true} />}
            {deductSuccess && (
              <Alert text={deductSuccess} bgColor="#9dffaab9" />
            )}

            <div className={styles.data}>
              <h3>Data</h3>
              <div className={styles.cards}>
                <div className={styles.card}>
                  <p>Total Earnings</p>
                  <h2>${allEarnings}</h2>
                </div>
                <div className={styles.card}>
                  <p>Total Money Handled</p>
                  <h2>${handled}</h2>
                </div>
              </div>
              <StatisticsCard balance={data} forceExtra={6} />
            </div>
          </div>
        </section>
      </main>
    )
  );
}

export default OwnerDashboard;
