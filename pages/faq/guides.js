import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/FaqArticle.module.scss";

import { isMobile } from "react-device-detect";

import { useRouter } from "next/router";

function FaqGuides() {
  const router = useRouter();

  const [guides] = useState([
    {
      name: "okex",
      mobileLink: "okx-mobile-NOTFOUND",
      pcLink: "okx-pc-NOTFOUND",
      comingSoon: false,
    },
    {
      name: "binance",
      mobileLink: "binance-NOTFOUND",
      pcLink: "binance-NOTFOUND",
      comingSoon: false,
    },
    {
      name: "kucoin",
      mobileLink: "kucoin-mobile-NOTFOUND",
      pcLink: "kucoin-pc-NOTFOUND",
      comingSoon: true,
    },
    {
      name: "huobi",
      mobileLink: "huobi-mobile-NOTFOUND",
      pcLink: "huobi-pc-NOTFOUND",
      comingSoon: true,
    },
  ]);

  return (
    <main className={styles.faqArticle}>
      <Head>
        <title>Guides | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        <div className={styles.returnMsg}>
          <p>
            You want to return?{" "}
            <span onClick={() => router.back()}>Click here to go back</span>
          </p>
        </div>
        <div className={styles.articleGrid}>
          {guides.map((guide, i) => (
            <a
              className={`${styles.article} ${
                guide.comingSoon ? styles.comingSoon : undefined
              }`}
              href={`https://www.rocketwizard.io/${
                isMobile ? guide.mobileLink : guide.pcLink
              }.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              key={i}
            >
              <img src={`/images/faq/articles/${guide.name}.svg`} alt="guide" />
              <p>{guide.name.toUpperCase()} API GUIDE</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

export default FaqGuides;
