import Head from "next/head";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import styles from "../../styles/Trader.module.scss";

import { useSession } from "next-auth/react";

import { useRouter } from "next/router";

import GaugeChart from "react-gauge-chart";

function Trader({ traders }) {
  const router = useRouter();

  const [trader, setTrader] = useState(traders[0]);

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

  const [desc, setDesc] = useState(null);

  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    trader.subscribers &&
      trader.subscribers.forEach((subber) => {
        if (session && subber.email === session.user.email) {
          setSubscribed(true);
        }
      });
  }, [trader]);

  useEffect(() => {
    const id = router.query.trader;
    if (id) {
      let traderTemp = traders.find((trader) => trader.id === id);
      setTrader(traderTemp || traders[0]);
      setDesc(traderTemp.description || "");
    }
  }, [router]);

  const checkValues = () => {
    return desc;
  };

  const formatRiskText = (val) => {
    if (trader.full) return "";

    if (val <= 5) {
      return "Very low";
    } else if (val <= 15) {
      return "Low";
    } else {
      return "Medium";
    }
  };

  const submit = async () => {
    if (checkValues()) {
      const response = await fetch("/api/update-trader", {
        method: "POST",
        body: JSON.stringify({
          traderID,
          description: desc,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      router.replace("/traders");
    }
  };

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
          <p>{trader.username}</p>
        </section>

        {/* Body Section */}

        <section className={styles.body}>
          <div className={styles.description}>
            <h4>Description</h4>
            {traderID === trader.id ? (
              <textarea
                className={styles.descInput}
                placeholder={trader.description}
                onChange={(e) => setDesc(e.target.value)}
              />
            ) : (
              <p>{trader.description}</p>
            )}
          </div>
          <div className={styles.details}>
            <div className={styles.box}>
              <h3>Risk</h3>
              <GaugeChart
                id="gauge-chart2"
                nrOfLevels={20}
                percent={trader.full ? 0 : trader.risk / 100}
                textColor={"black"}
                style={{
                  width: "60%",
                }}
                hideText={true}
              />
              <h2>{formatRiskText(trader.risk)}</h2>
            </div>
            <div className={styles.box}>
              <h3>Projected Monthly ROI</h3>
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
                <h4>
                  {trader.full
                    ? "--%"
                    : `${trader.monthlyRoi}% - ${trader.monthlyRoiMax}%`}
                </h4>
              </div>
            </div>
            <div className={styles.box}>
              <h3>Projected 12 Months ROI</h3>
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

                <h4>{trader.full ? "---%" : `${trader.yearlyRoi}%`}</h4>
              </div>
            </div>
          </div>
          {traderID === trader.id ? (
            <button onClick={submit}>UPDATE</button>
          ) : (
            <>
              {subscribed ? (
                <button>SUBSCRIBED</button>
              ) : (
                <Link href={`/traders/subscribe/${trader.id}`}>
                  <button>SUBSCRIBE</button>
                </Link>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const res = await fetch(`https://www.rocketwizard.io/api/traders`);

  const traders = await res.json();

  return { props: { traders } };
}

export default Trader;
