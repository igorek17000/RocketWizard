import React, { useState, useEffect } from "react";
import styles from "../../styles/TraderDashboard.module.scss";

import { Oval } from "react-loader-spinner";

import { StatisticsCard } from "./index";

import NowPaymentsApi from "@nowpaymentsio/nowpayments-api-js";

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

function CodeOwnerDashboard({ NPApi }) {
  const npApi = new NowPaymentsApi({ apiKey: NPApi });

  const [data, setData] = useState(null);
  const [subCount, setSubCount] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [allEarnings, setAllEarnings] = useState(0);

  const getData = async () => {
    const payments = await npApi.getListPayments();

    console.log("PAYMENTS: ", payments);
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
            <p>New subscribers</p>
            <h2>{getDaily()}</h2>
          </div>
          <div className={styles.card}>
            <p>Total subscribers</p>
            <h2>{subCount}</h2>
          </div>
        </div>
        <div className={styles.cards}>
          <div className={styles.card}>
            <p>Monthly earnings</p>
            <h2 className={styles.price}>{monthlyEarnings / 2}$</h2>
          </div>
          <div className={styles.card}>
            <p>Total earnings</p>
            <h2 className={styles.price}>{allEarnings / 2}$</h2>
          </div>
        </div>
        <StatisticsCard balance={data} forceExtra={subCount < 20 ? 5 : 20} />
      </div>
    </section>
  );
}

export default CodeOwnerDashboard;
