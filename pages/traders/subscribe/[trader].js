import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../../../styles/Subscribe.module.scss";

import { useRouter } from "next/router";

import SubscribePlan from "../../../components/SubscribePlan";

function Subscribe() {
  const router = useRouter();

  const [traders] = useState([
    {
      id: "david",
      pfp: "david.svg",
      name: "David",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 50,
      description:
        "I am Achraf , UI/UX Designer and IOS Developer , I jumped into designing with a hobby more than 5 years ago and now have been in the field as a professional UI/UX designer. During this time i learned and worked with clients of all scopes and sectors to create better experiences through design. I am passionate about solving problems and providing solutions that are simple and elegant only High Quality designs and unique, I will transform any ideas into beautifully packaged products that are ready to us",
    },
    {
      id: "maximus",
      pfp: "maximus.svg",
      name: "Maximus",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 60,
      description:
        "I am Achraf , UI/UX Designer and IOS Developer , I jumped into designing with a hobby more than 5 years ago and now have been in the field as a professional UI/UX designer. During this time i learned and worked with clients of all scopes and sectors to create better experiences through design. I am passionate about solving problems and providing solutions that are simple and elegant only High Quality designs and unique, I will transform any ideas into beautifully packaged products that are ready to us",
    },
    {
      id: "riddy",
      pfp: "toni.svg",
      name: "Riddy",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 55,
      description:
        "I am Achraf , UI/UX Designer and IOS Developer , I jumped into designing with a hobby more than 5 years ago and now have been in the field as a professional UI/UX designer. During this time i learned and worked with clients of all scopes and sectors to create better experiences through design. I am passionate about solving problems and providing solutions that are simple and elegant only High Quality designs and unique, I will transform any ideas into beautifully packaged products that are ready to us",
    },
    {
      id: "david",
      pfp: "belly.svg",
      name: "John",
      monthlyRoi: 105,
      yearlyRoi: 105,
      winrate: 66,
      description:
        "I am Achraf , UI/UX Designer and IOS Developer , I jumped into designing with a hobby more than 5 years ago and now have been in the field as a professional UI/UX designer. During this time i learned and worked with clients of all scopes and sectors to create better experiences through design. I am passionate about solving problems and providing solutions that are simple and elegant only High Quality designs and unique, I will transform any ideas into beautifully packaged products that are ready to us",
    },
  ]);

  const [trader, setTrader] = useState(traders[0]);

  useEffect(() => {
    const id = router.query.trader;
    if (id) {
      setTrader(traders.find((trader) => trader.id === id) || traders[0]);
    }
  }, [router]);

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

export default Subscribe;
