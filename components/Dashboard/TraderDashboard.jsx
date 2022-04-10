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
  const [allEarnings, setAllEarnings] = useState(0);
  const [unpaid, setUnpaid] = useState(0);

  const [unpaidSubscribers, setUnpaidSubscribers] = useState(0);
  const [paidSubscribers, setPaidSubscribers] = useState(0);

  const [priceMultipliers] = useState([1, 1.6, 1.75]);

  const [earnMultiplier, setEarnMultiplier] = useState(1);

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

  const updateEarnMultiplier = (subs, traderId) => {
    if (traderId === "raz") {
      if (subs < 60) setEarnMultiplier(0.5);
      if (subs < 100) setEarnMultiplier(0.55);
      else if (subs < 150) setEarnMultiplier(0.6);
      else if (subs < 250) setEarnMultiplier(0.65);
      else setEarnMultiplier(0.75);
    } else {
      if (subs < 60) setEarnMultiplier(0.5);
      else if (subs < 110) setEarnMultiplier(0.55);
      else if (subs < 130) setEarnMultiplier(0.57);
      else if (subs < 150) setEarnMultiplier(0.6);
      else if (subs < 180) setEarnMultiplier(0.63);
      else if (subs < 220) setEarnMultiplier(0.66);
      else setEarnMultiplier(0.7);
    }

    return;
  };

  const getData = async () => {
    const res = await fetch(
      `http://localhost:3000/api/get-trader?id=${traderID}`
    );

    const trader = await res.json();

    const subscribers = trader.subscribers;

    setSubCount(subscribers ? subscribers.length : 0);

    const tempData = {
      daily: new Array(24).fill(0),
      weekly: new Array(14).fill(0),
      monthly: new Array(30).fill(0),
    };

    let sum = 0;
    let unpaidSum = 0;

    let unpaidSubs = 0;

    let all = subscribers ? subscribers.length : 0;

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

    updateEarnMultiplier(subscribers.length, trader.id);

    for (const [i, tier] of trader.allTimeSubs.entries()) {
      if (i > trader.paidFor - 1) {
        unpaidSum += getPrice(trader.basePrice, tier);
        unpaidSubs++;
      }

      sum += getPrice(trader.basePrice, tier);
    }

    setUnpaidSubscribers(unpaidSubs);
    setPaidSubscribers(all - unpaidSubs);

    setAllEarnings(Math.round(sum * 100) / 100);
    setUnpaid(Math.round(unpaidSum * 100) / 100);

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
            <h2 className={styles.price}>
              {Math.round(unpaid * earnMultiplier * 100) / 100}$
            </h2>
          </div>
          <div className={styles.card}>
            <p>Total earnings</p>
            <h2 className={styles.price}>
              {Math.round(allEarnings * earnMultiplier * 100) / 100}$
            </h2>
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
