import Head from "next/head";
import React, { useState } from "react";
import styles from "../../styles/Traders.module.scss";

import TraderCard from "../../components/TraderCard";

import { getSession } from "next-auth/react";

import Alert from "../../components/Alert";

function Traders({ traders, traderID }) {
  console.log(traderID);

  return (
    <main className={styles.traders}>
      <Head>
        <title>Traders | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.traderCards}>
        <div className={styles.disclaimer}>
          <Alert
            text="Cross exchange functionality will be ready soon."
            error={true}
            center={true}
          />
        </div>

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
  const res = await fetch(`http://localhost:3000/api/traders`);

  const traders = await res.json();

  const session = await getSession({ req });
  if (session) {
    const isTraderRes = await fetch(
      `http://localhost:3000/api/isTrader?email=${session.user.email}`
    );

    const traderID = await isTraderRes.json();

    return { props: { traders, traderID: traderID.traderID || null } };
  } else {
    return { props: { traders, traderID: null } };
  }
}

export default Traders;
