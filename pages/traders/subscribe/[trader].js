import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../../../styles/Subscribe.module.scss";

import { useRouter } from "next/router";

import SubscribePlan from "../../../components/SubscribePlan";

function Subscribe({ traders }) {
  const router = useRouter();

  const [trader, setTrader] = useState(traders[0]);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    const id = router.query.trader;
    if (id && traders) {
      let tempTrader = traders.find((trader) => trader.id === id) || traders[0];
      setTrader(tempTrader);

      if (tempTrader.unavailable || tempTrader.full || tempTrader.comingSoon) {
        setDisplay(false);
      } else setDisplay(true);
    }
  }, [router]);

  if (!trader) return null;

  return (
    display && (
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
    )
  );
}

export async function getServerSideProps() {
  const res = await fetch(`htpps://www.rocketwizard.io/api/traders`);

  const traders = await res.json();

  // Pass data to the page via props
  return { props: { traders } };
}

export default Subscribe;
