import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../../../styles/Subscribe.module.scss";

import { useRouter } from "next/router";

import SubscribePlan from "../../../components/SubscribePlan";

function Subscribe({ traders }) {
  const router = useRouter();

  const [trader, setTrader] = useState(traders[0]);

  useEffect(() => {
    const id = router.query.trader;
    if (id && traders) {
      setTrader(traders.find((trader) => trader.id === id) || traders[0]);
    }
  }, [router]);

  if (!trader) return null;

  return (
    <main className={styles.subscribe}>
      <Head>
        <title>{trader.name} | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.subscribePlans}>
        {[0, 1, 2].map((val) => (
          <SubscribePlan id={val} key={val} trader={trader} />
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

export default Subscribe;
