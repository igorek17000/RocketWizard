import React, { useState, useEffect } from "react";
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

function TraderDashboard({ traderID }) {
  const [data, setData] = useState(null);
  const [subCount, setSubCount] = useState(0);

  const getDiff = (dateParam) => {
    const now = new Date();
    const date = new Date(dateParam);

    return Math.floor(Math.abs(now - date) / 36e5);
  };

  const getData = async () => {
    const res = await fetch(
      `https://rocket-wizard.vercel.app/api/get-trader?id=${traderID}`
    );

    const trader = await res.json();

    const subscribers = trader.subscribers;

    setSubCount(subscribers.length);

    const tempData = {
      daily: new Array(24).fill(0),
      weekly: new Array(14).fill(0),
      monthly: new Array(30).fill(0),
    };

    for await (const subscriber of subscribers) {
      const diff = getDiff(subscriber.startDate);

      console.log(tempData.daily[24]);

      if (diff < 24) {
        const index = 24 - diff;
        tempData.daily[index - 1] = tempData.daily[index - 1] + 1;
      } else if (diff < 24 * 7) {
        const index = 14 - diff / 12;
        tempData.weekly[index - 1] = tempData.weekly[index - 1] + 1;
      } else if (diff < 24 * 30) {
        const index = 30 - diff / 24;
        tempData.monthly[index - 1] = tempData.monthly[index - 1] + 1;
      }
    }

    setData(tempData);
  };

  const getDaily = () => data.daily.reduce((a, b) => a + b);

  useEffect(() => {
    getData();
  }, []);

  console.log(data);

  return !data ? (
    <section className={styles.traderDashboard}>
      <Oval color="#731bde" secondaryColor="#a879e0" height={80} width={80} />
    </section>
  ) : (
    <section className={styles.traderDashboard}>
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
        <StatisticsCard balance={data} />
      </div>
    </section>
  );
}

export default TraderDashboard;
