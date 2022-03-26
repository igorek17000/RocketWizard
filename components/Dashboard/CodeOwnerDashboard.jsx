import React, { useState, useEffect } from "react";
import Script from "next/script";
import styles from "../../styles/TraderDashboard.module.scss";

import { Oval } from "react-loader-spinner";

import { StatisticsCard } from "./index";

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

function CodeOwnerDashboard({ code }) {
  const [data, setData] = useState(null);
  const [uses, setUses] = useState(0);
  const [dailyUses, setDailyUses] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [allEarnings, setAllEarnings] = useState(0);

  const getData = async () => {
    const res = await fetch("/api/get-code-use-data", {
      method: "POST",
      body: JSON.stringify({
        code,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const allData = await res.json();

    setData(allData.tempData);
    setUses(allData.allUses);
    setDailyUses(allData.daily);
    setMonthlyEarnings(allData.month);
    setAllEarnings(allData.all);
  };

  useEffect(() => {
    getData();
  }, []);

  return !data ? (
    <section className={styles.traderDashboard}>
      <Script src="https://unpkg.com/@nowpaymentsio/nowpayments-api-js/dist/nowpayments-api-js.min.js"></Script>
      <Oval color="#731bde" secondaryColor="#a879e0" height={80} width={80} />
    </section>
  ) : (
    <section className={styles.traderDashboard}>
      <Script src="https://unpkg.com/@nowpaymentsio/nowpayments-api-js/dist/nowpayments-api-js.min.js"></Script>
      <div className={styles.top}>
        <h1>{getGreeting()}</h1>
      </div>
      <div className={styles.body}>
        <div className={styles.cards}>
          <div className={styles.card}>
            <p>New uses</p>
            <h2>{dailyUses}</h2>
          </div>
          <div className={styles.card}>
            <p>Total uses</p>
            <h2>{uses}</h2>
          </div>
        </div>
        <div className={styles.cards}>
          <div className={styles.card}>
            <p>Monthly earnings</p>
            <h2 className={styles.price}>{monthlyEarnings}$</h2>
          </div>
          <div className={styles.card}>
            <p>Total earnings</p>
            <h2 className={styles.price}>{allEarnings}$</h2>
          </div>
        </div>
        <StatisticsCard balance={data} forceExtra={uses < 20 ? 2 : 7} />
      </div>
    </section>
  );
}

export default CodeOwnerDashboard;
