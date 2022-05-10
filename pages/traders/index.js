import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../../styles/Traders.module.scss";

import TraderCard from "../../components/TraderCard";

import { useSession } from "next-auth/react";
import Alert from "../../components/Alert";
import { motion } from "framer-motion";

function Traders({ traders }) {
  const [traderID, setTraderID] = useState(null);

  const { data: session, status } = useSession();

  const userIsTrader = async () => {
    if (!session) return;

    const isTraderRes = await fetch(`https://www.rocketwizard.io/api/isTrader`);

    const traderIDjson = await isTraderRes.json();

    setTraderID(traderIDjson.traderId);
  };

  useEffect(() => {
    userIsTrader();
  }, [session]);

  return (
    <main className={styles.traders}>
      <Head>
        <title>Traders | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className={styles.traderCards}>
        <div className={styles.disclaimer}></div>

        {traders.map((trader, i) => (
          <motion.div
            className={styles.motionDiv}
            transition={{ duration: 0.4, delay: 0.2 * i }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={i}
          >
            <TraderCard
              trader={trader}
              i={i}
              isTrader={traderID === trader.id}
            />
          </motion.div>
        ))}
      </section>
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const res = await fetch(`https://www.rocketwizard.io/api/traders`);

  const traders = await res.json();

  return { props: { traders } };
}

export default Traders;
