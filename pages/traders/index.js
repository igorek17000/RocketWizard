import Head from "next/head";
import React, { useState } from "react";
import styles from "../../styles/Traders.module.scss";

import TraderCard from "../../components/TraderCard";

function Traders() {
  const [traders] = useState([
    {
      pfp: "david.svg",
      name: "David Mos",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 50,
    },
    {
      pfp: "maximus.svg",
      name: "Maximus Faycurry",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 60,
    },
    {
      pfp: "toni.svg",
      name: "Toni Alderlight",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 55,
    },
    {
      pfp: "belly.svg",
      name: "Belly Anderson",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 66,
    },
  ]);

  return (
    <main className={styles.traders}>
      <Head>
        <title>Traders | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.traderCards}>
        {traders.map((trader, i) => (
          <TraderCard key={i} trader={trader} i={i} />
        ))}
      </section>
    </main>
  );
}

export default Traders;
