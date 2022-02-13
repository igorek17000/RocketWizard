import Head from "next/head";
import React, { useState } from "react";
import styles from "../../../styles/Subscribe.module.scss";

import { useRouter } from "next/router";

import SubscribePlan from "../../../components/SubscribePlan";

function Subscribe() {
  const router = useRouter();

  const index = router.query.i;

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
    <main className={styles.subscribe}>
      <Head>
        <title>Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.subscribePlans}>
        {[0, 1, 2].map((val) => (
          <SubscribePlan id={val} key={val} trader={traders[index || 0]} />
        ))}
      </section>
    </main>
  );
}

export default Subscribe;
