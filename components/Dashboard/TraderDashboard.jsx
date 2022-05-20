import React, { useState, useEffect } from "react";
import styles from "../../styles/TraderDashboard.module.scss";
import CopytradingSwitch from "../CopytradingSwitch";

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
  const [allEarnings, setAllEarnings] = useState(0);
  const [unpaid, setUnpaid] = useState(0);

  const [unpaidSubscribers, setUnpaidSubscribers] = useState(0);
  const [paidSubscribers, setPaidSubscribers] = useState(0);

  const [priceMultipliers] = useState([1, 1.6, 1.75]);

  const getDiff = (dateParam) => {
    const now = new Date();
    const date = new Date(dateParam);

    return Math.floor(Math.abs(now - date) / 36e5);
  };

  const calcEarnMultiplier = (subs, traderId) => {
    if (subs < 150) return 0.5;

    return 0.55;
  };

  const getData = async () => {
    const res = await fetch(
      `${process.env.DEV_URL}api/get-trader?id=${traderID}`
    );

    const earningsRes = await fetch("/api/get-trader-payment", {
      method: "POST",
      body: JSON.stringify({
        traderId: traderID,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const trader = await res.json();

    const subscribers = trader.subscribers;

    const earnings = await earningsRes.json();

    setSubCount(subscribers ? subscribers.length : 0);

    const tempData = {
      daily: new Array(24).fill(0),
      weekly: new Array(14).fill(0),
      monthly: new Array(30).fill(0),
    };

    let sum = 0;
    let paidSum = 0;
    let unpaidSum = 0;

    let unpaidSubs = 0;
    let paidSubs = 0;

    if (subscribers) {
      for await (const subscriber of subscribers) {
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
      if (i > trader.paidFor - 1) {
        unpaidSubs++;
      } else {
        paidSubs++;
      }
    }

    let allEarnMulti = calcEarnMultiplier(subscribers.length, trader.id);

    sum = Math.round(earnings.all * allEarnMulti * 100) / 100;
    paidSum = Math.round(trader.paidAmount * 100) / 100;
    unpaidSum = Math.round((sum - paidSum) * 100) / 100;

    setUnpaidSubscribers(unpaidSubs);
    setPaidSubscribers(paidSubs);

    const deduction = (trader.deduction || 0) / 100;

    unpaidSum = Math.round(unpaidSum * (1 - deduction) * 100) / 100;

    setAllEarnings(sum);
    setUnpaid(unpaidSum);

    setData(tempData);
  };

  const getDaily = () => data.daily.reduce((a, b) => a + b);

  useEffect(() => {
    getData();
  }, []);

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
        <CopytradingSwitch />
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
            <p>Unpaid</p>
            <h2 className={styles.price}>{unpaid}$</h2>
          </div>
          <div className={styles.card}>
            <p>Total earnings</p>
            <h2 className={styles.price}>{allEarnings}$</h2>
          </div>
        </div>
        <div className={styles.cards}>
          <div className={styles.card}>
            <p>Unpaid Subs</p>
            <h2 className={styles.price}>{unpaidSubscribers}</h2>
          </div>
          <div className={styles.card}>
            <p>Paid Subs</p>
            <h2 className={styles.price}>{paidSubscribers}</h2>
          </div>
        </div>
        <StatisticsCard balance={data} forceExtra={subCount < 20 ? 1 : 6} />
      </div>
    </section>
  );
}

export default TraderDashboard;
