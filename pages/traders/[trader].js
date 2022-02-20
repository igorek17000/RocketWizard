import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../../styles/Trader.module.scss";

import { useRouter } from "next/router";

function Trader({ traders }) {
  const router = useRouter();

  const [trader, setTrader] = useState(traders[0]);

  useEffect(() => {
    const id = router.query.trader;
    if (id) {
      setTrader(traders.find((trader) => trader.id === id) || traders[0]);
    }
  }, [router]);

  return (
    <main className={styles.trader}>
      <Head>
        <title>{trader.name} | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        {/* Header Section */}

        <section className={styles.header}>
          <img
            className={styles.pfp}
            src={`/images/traders/pfps/${trader.id}.svg`}
            alt="Trader pfp"
          />
          <h3>{trader.name}</h3>
        </section>

        {/* Body Section */}

        <section className={styles.body}>
          <div className={styles.description}>
            <h4>Description</h4>
            <p>{trader.description}</p>
          </div>
          <div className={styles.details}>
            <div className={styles.box}>
              <h3>Winrate</h3>
              <div className={styles.winrate}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10.803"
                  height="21.978"
                  viewBox="0 0 10.803 21.978"
                >
                  <path
                    id="Icon_awesome-long-arrow-alt-up"
                    data-name="Icon awesome-long-arrow-alt-up"
                    d="M4.7,8.827V23.639a.589.589,0,0,0,.589.589H8.033a.589.589,0,0,0,.589-.589V8.827h2.26a1.177,1.177,0,0,0,.833-2.01L7.492,2.595a1.177,1.177,0,0,0-1.665,0L1.605,6.817a1.177,1.177,0,0,0,.833,2.01Z"
                    transform="translate(-1.258 -2.25)"
                    fill="#731bde"
                  />
                </svg>
                <h4>{trader.winrate}%</h4>
              </div>
            </div>
            <div className={styles.box}>
              <h3>Monthly ROI</h3>
              <div className={styles.monthlyRoi}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="5.609"
                  height="11.411"
                  viewBox="0 0 5.609 11.411"
                >
                  <path
                    id="Icon_awesome-long-arrow-alt-up"
                    data-name="Icon awesome-long-arrow-alt-up"
                    d="M3.044,5.665v7.691a.306.306,0,0,0,.306.306H4.776a.306.306,0,0,0,.306-.306V5.665H6.255a.611.611,0,0,0,.432-1.044L4.495,2.429a.611.611,0,0,0-.865,0L1.438,4.621a.611.611,0,0,0,.432,1.044Z"
                    transform="translate(-1.258 -2.25)"
                    fill="#1bde8e"
                  />
                </svg>
                <h4>{trader.monthlyRoi}%</h4>
              </div>
            </div>
            <div className={styles.box}>
              <h3>12 Months ROI</h3>
              <div className={styles.yearlyRoi}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="5.609"
                  height="11.411"
                  viewBox="0 0 5.609 11.411"
                >
                  <path
                    id="Icon_awesome-long-arrow-alt-up"
                    data-name="Icon awesome-long-arrow-alt-up"
                    d="M3.044,5.665v7.691a.306.306,0,0,0,.306.306H4.776a.306.306,0,0,0,.306-.306V5.665H6.255a.611.611,0,0,0,.432-1.044L4.495,2.429a.611.611,0,0,0-.865,0L1.438,4.621a.611.611,0,0,0,.432,1.044Z"
                    transform="translate(-1.258 -2.25)"
                    fill="#f0b207"
                  />
                </svg>

                <h4>{trader.yearlyRoi}%</h4>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export async function getServerSideProps() {
  const res = await fetch(`https://rocketwizard.netlify.app/api/traders`);

  const traders = await res.json();

  // Pass data to the page via props
  return { props: { traders } };
}

export default Trader;
