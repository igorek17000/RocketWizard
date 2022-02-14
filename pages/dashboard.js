import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Dashboard.module.scss";

import {
  BalanceCard,
  Deal,
  RoiCard,
  StatisticsCard,
  Subscription,
} from "../components/Dashboard";

function Dashboard() {
  const [deals] = useState([
    {
      name: "Subscription 40% Off",
      description:
        "Get your subscription with 40% discount Hurry up time is running",
      bgColor: "#C091F9",
    },
    {
      name: "Subscription 40% Off",
      description:
        "Get your subscription with 40% discount Hurry up time is running",
      bgColor: "#A1FFCD",
    },
    {
      name: "Subscription 40% Off",
      description:
        "Get your subscription with 40% discount Hurry up time is running",
      bgColor: "#FCDF90",
    },
  ]);

  const [subscriptions] = useState([
    {
      id: 2,
      end: new Date(2022, 2, 15),
      price: 120,
    },
    {
      id: 1,
      end: new Date(2022, 2, 2),
      price: 89,
    },
    {
      id: 0,
      end: new Date(2022, 2, 17),
      price: 79,
    },
  ]);

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

  return (
    <main className={styles.dashboard}>
      <Head>
        <title>Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        <section className={styles.left}>
          <section className={styles.data}>
            <h1>{getGreeting()}</h1>
            <div className={styles.body}>
              <div className={styles.balanceRoiCards}>
                <BalanceCard />
                <RoiCard />
              </div>
              <StatisticsCard />
            </div>
          </section>
          <section className={styles.deals}>
            <h2>My deals</h2>
            <div className={styles.dealList}>
              {deals.map((deal, i) => (
                <Deal deal={deal} key={i} />
              ))}
            </div>
          </section>
        </section>
        <section className={styles.right}>
          <h2>My Subscriptions</h2>
          <div className={styles.subscriptionList}>
            {subscriptions.map((subscription, i) => (
              <Subscription subscription={subscription} key={i} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
