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
      name: "okx",
      mobileLink: "OKX_GUIDE",
      pcLink: "OKX_GUIDE",
      comingSoon: false,
    },
    {
      name: "binance",
      mobileLink: "BINANCE_GUIDE",
      pcLink: "BINANCE_GUIDE",
      comingSoon: false,
    },
    {
      name: "kucoin",
      mobileLink: "kucoin-mobile",
      pcLink: "kucoin-pc",
      comingSoon: true,
    },
    {
      name: "huobi",
      mobileLink: "huobi-mobile",
      pcLink: "huobi-pc",
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
              href={`${process.env.DEV_URL}${
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
