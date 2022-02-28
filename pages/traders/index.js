import Head from "next/head";
import React, { useState } from "react";
import styles from "../../styles/Traders.module.scss";

import TraderCard from "../../components/TraderCard";

function Traders({ traders }) {
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

export async function getServerSideProps() {
  const res = await fetch(`http://localhost:3000/api/traders`);

  const traders = await res.json();

  // Pass data to the page via props
  return { props: { traders } };
}

export default Traders;
