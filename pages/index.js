import React, { useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import Link from "next/link";

export default function Home() {
  const [cards] = useState([
    {
      img: "shield.svg",
      title: "Top Tier Risk Mitigation",
      text: "Risk management implemented at its best form with a 96% Trades winning rate",
    },
    {
      img: "roi.svg",
      title: "50% Average ROI",
      text: "Get 50% and above on your initial investment monthly",
    },
    {
      img: "automatic.svg",
      title: "Fully automatic",
      text: "Zero efforts, avoid wasting time, energy and getting stressed with taking trades all day long",
    },
  ]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* Top Section */}

        <section className={styles.top}>
          <div className={styles.left}>
            <h1>
              Make Money While <span>Sleeping</span>
            </h1>
            <p>By traders, for everyone</p>
          </div>
          <div className={styles.right}>
            <img src="/images/home/exchanges.svg" alt="Exchanges icon" />
            <Link href="/signup">
              <button>Start Now</button>
            </Link>
          </div>
        </section>

        {/* Bottom Section */}

        <section className={styles.bottom}>
          <div className={styles.cards}>
            {cards.map((card, i) => (
              <div className={styles.card} key={i}>
                <img src={`/images/home/cards/${card.img}`} alt="Card icon" />
                <div className={styles.text}>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/traders">
            <button>VIEW OUR TRADERS</button>
          </Link>
        </section>
      </main>
    </div>
  );
}
