import React, { useState, useEffect } from "react";
import Script from "next/script";
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

const getDiff = (dateParam) => {
  const now = new Date();
  const date = new Date(dateParam);

  return Math.floor(Math.abs(now - date) / 36e5);
};

function CodeOwnerDashboard({ NPApi, code = "PENNY" }) {
  const npApi = new NowPaymentsApi({ apiKey: NPApi });

  const [data, setData] = useState(null);
  const [uses, setUses] = useState(0);
  const [dailyUses, setDailyUses] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [allEarnings, setAllEarnings] = useState(0);

  const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
  };

  const getData = async () => {
    const paymentTemp = await npApi.getListPayments();

    const limit = paymentTemp.total;

    const paymentsAll = await npApi.getListPayments({ limit });

    let payments = await paymentsAll.data.filter(
      (payment) =>
        payment.payment_status !== "expired" &&
        payment.payment_status !== "waiting"
    );

    console.log("PAYMENTS: ", payments);

    payments = await asyncFilter(payments, async (payment) => {
      if (payment.order_id.split(" ")[5] !== code) {
        return false;
      }

      if (payment.payment_status === "partially_paid") {
        const res = await fetch("/api/has-paid", {
          method: "POST",
          body: JSON.stringify({
            payment,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();

        return json.success;
      }

      return true;
    });

    let all = 0,
      month = 0,
      allUses = 0,
      daily = 0;

    const tempData = {
      daily: new Array(24).fill(0),
      weekly: new Array(14).fill(0),
      monthly: new Array(30).fill(0),
    };

    for await (const payment of payments) {
      console.log(payment);

      all += payment.outcome_amount * 0.1;
      allUses++;

      const diff = getDiff(payment.created_at);

      if (diff < 24) {
        const index = Math.round(24 - diff);
        tempData.daily[index - 1] = tempData.daily[index - 1] + 1;

        daily++;
      }

      if (diff < 24 * 7) {
        const index = 14 - Math.round(diff / 12);
        tempData.weekly[index - 1] = tempData.weekly[index - 1] + 1;
      }

      if (diff < 24 * 30) {
        const index = 30 - Math.round(diff / 24);
        tempData.monthly[index - 1] = tempData.monthly[index - 1] + 1;

        month += payment.outcome_amount * 0.1;
      }
    }

    console.log(all, month, allUses, daily);

    setAllEarnings(Math.round(all * 10) / 10);
    setMonthlyEarnings(Math.round(month * 10) / 10);
    setUses(allUses);
    setDailyUses(daily);
    setData(tempData);

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
            <h2 className={styles.price}>{monthlyEarnings / 2}$</h2>
          </div>
          <div className={styles.card}>
            <p>Total earnings</p>
            <h2 className={styles.price}>{allEarnings / 2}$</h2>
          </div>
        </div>
        <StatisticsCard balance={data} forceExtra={uses < 20 ? 5 : 20} />
      </div>
    </section>
  );
}

export default CodeOwnerDashboard;
