import Head from "next/head";
import React, { useState } from "react";
import styles from "../../styles/Traders.module.scss";

import TraderCard from "../../components/TraderCard";

function Traders() {
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
