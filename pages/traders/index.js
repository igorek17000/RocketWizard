import Head from "next/head";
import React, { useState } from "react";
import styles from "../../styles/Traders.module.scss";

import TraderCard from "../../components/TraderCard";

import { getSession } from "next-auth/react";

function Traders({ traders, traderID }) {
  return (
    <main className={styles.traders}>
      <Head>
        <title>Traders | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.traderCards}>
        {traders.map((trader, i) => (
          <TraderCard
            key={i}
            trader={trader}
            i={i}
            isTrader={traderID === trader.id}
          />
        ))}
      </section>
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const res = await fetch(`https://rocket-wizard.vercel.app/api/traders`);

  const traders = await res.json();

  const session = await getSession({ req });
  if (session) {
    const isTraderRes = await fetch(
      `https://rocket-wizard.vercel.app/api/isTrader?email=${session.user.email}`
    );

    const traderID = await isTraderRes.json();

    return { props: { traders, traderID: traderID.traderID } };
  } else {
    return { props: { traders, traderID: null } };
  }
}

export default Traders;
