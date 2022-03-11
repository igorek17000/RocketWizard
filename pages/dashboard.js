import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Dashboard.module.scss";

import { useSession, getSession } from "next-auth/react";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Oval } from "react-loader-spinner";

import Select from "react-select";

import {
  BalanceCard,
  Deal,
  RoiCard,
  StatisticsCard,
  Subscription,
} from "../components/Dashboard";
import GuestMessage from "../components/Dashboard/GuestMessage";
import TraderDashboard from "../components/Dashboard/TraderDashboard";
import Renew from "../components/Renew";
import Upgrade from "../components/Upgrade";
import Alert from "../components/Alert";

/*
DEAL:     {
      name: "Subscription 40% Off",
      description:
        "Get your subscription with 40% discount! Hurry up time is running out!",
      bgColor: "#FCDF90",
    },
*/

const customStyles = {
  control: () => ({
    // none of react-select's styles are passed to <Control />
    width: "100%",
    display: "flex",
    padding: "0.4rem 0.5rem",
    fontSize: "1rem",
  }),
  option: (provided, state) => ({
    ...provided,
    color: "black",
  }),
  menuList: (base) => ({
    ...base,
    "::-webkit-scrollbar": {
      width: "5px",
      height: "0px",
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#888",
      borderRadius: 10,
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  }),
};

function Dashboard({ subscriptions, traderID, traders, disclaimer }) {
  const [api, setApi] = useState(null);
  const [options, setOptions] = useState([]);

  const [renewOpen, setRenewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const [balance, setBalance] = useState({
    daily: [],
    weekly: [],
    monthly: [],
  });

  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();

  const changeApi = async (value) => {
    setApi(value);

    const res = await fetch(
      `https://www.rocketwizard.io/api/balance?email=${session.user.email}&apiName=${value.value}`
    );

    const balance = await res.json();

    setBalance(balance);
  };

  const getAPIs = async () => {
    if (session) {
      const res = await fetch(
        `https://www.rocketwizard.io/api/apiKeys?email=${session.user.email}`
      );

      const keys = await res.json();

      let tempOptions = [];

      for await (const key of keys) {
        tempOptions.push({
          value: key.name,
          label: (
            <div
              className={styles.labels}
              style={{
                display: "flex",
                alignItems: "center",
                placeContent: "space-between",
              }}
            >
              <p>{key.name}</p>
              <img
                src={`/images/settings/exchanges/${key.exchange}.svg`}
                alt="Exchange"
                className={styles.exchange}
                style={{ height: "1rem" }}
              />
            </div>
          ),
        });
      }

      setOptions(tempOptions);
    }
  };

  useEffect(() => {
    options && setLoading(false);
  }, [options]);

  useEffect(() => {
    getAPIs();
  }, [session]);

  const [deals] = useState([]);

  const getGreeting = () => {
    const hours = new Date().getHours();

    if (hours > 4 && hours < 12) {
      return "Good Morning!";
    } else if (hours > 12 && hours < 18) {
      return "Good Afternoon!";
    } else {
      return "Good Evening!";
    }
  };

  if (!session) return <GuestMessage />;

  return (
    <main className={styles.dashboard}>
      <Head>
        <title>Dashboard | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {subscription && (
        <Renew
          open={renewOpen}
          handleClose={() => setRenewOpen(false)}
          traders={traders}
          id={subscription.plan.id}
          traderId={subscription.traderId}
        />
      )}
      {subscription && (
        <Upgrade
          open={upgradeOpen}
          handleClose={() => setUpgradeOpen(false)}
          traders={traders}
          id={subscription.plan.id + 1}
          traderId={subscription.traderId}
        />
      )}

      {loading ? (
        <section className={`${styles.card} ${styles.loadingCard}`}>
          <Oval
            color="#731bde"
            secondaryColor="#a879e0"
            height={80}
            width={80}
          />
        </section>
      ) : (
        <>
          {traderID ? (
            <TraderDashboard traderID={traderID} />
          ) : (
            <section className={styles.card}>
              <section className={styles.left}>
                <section className={styles.data}>
                  <div className={styles.top}>
                    <h1>{getGreeting()}</h1>
                    {api && (
                      <Select
                        className={styles.select}
                        styles={customStyles}
                        options={options}
                        value={api}
                        onChange={changeApi}
                      />
                    )}
                  </div>

                  {api ? (
                    <div className={styles.body}>
                      <div className={styles.balanceRoiCards}>
                        <BalanceCard balance={balance} apiName={api.value} />
                        <RoiCard balance={balance} />
                      </div>
                      <StatisticsCard balance={balance} />
                      <Alert error={true} text={disclaimer} />
                    </div>
                  ) : (
                    <div className={styles.body}>
                      <div className={styles.noApi}>
                        <h3>Connect an API to access the dashboard data</h3>
                        <Select
                          className={styles.select}
                          styles={customStyles}
                          options={options}
                          value={api}
                          onChange={changeApi}
                        />
                      </div>
                    </div>
                  )}
                </section>
                <section className={styles.deals}>
                  <h2>My deals</h2>
                  <div className={styles.dealList}>
                    {deals.map((deal, i) => (
                      <Deal deal={deal} key={i} />
                    ))}
                  </div>
                </section>
              </section>
              <section className={styles.right}>
                <h2>My Subscriptions</h2>
                <div className={styles.subscriptionList}>
                  {subscriptions.map((subscription, i) => (
                    <Subscription
                      subscription={subscription}
                      key={i}
                      openRenew={(sub) => {
                        setRenewOpen(true);
                        setSubscription(sub);
                      }}
                      openUpgrade={(sub) => {
                        setUpgradeOpen(true);
                        setSubscription(sub);
                      }}
                    />
                  ))}
                </div>
              </section>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });

  const resTraders = await fetch(`https://www.rocketwizard.io/api/traders`);

  const traders = await resTraders.json();

  const resDisclaimer = await fetch(
    `https://www.rocketwizard.io/api/dashboardDisclaimer`
  );

  const disclaimer = await resDisclaimer.json();

  if (session) {
    const res = await fetch(
      `https://www.rocketwizard.io/api/subscribe?email=${session.user.email}`
    );

    const isTraderRes = await fetch(
      `https://www.rocketwizard.io/api/isTrader?email=${session.user.email}`
    );

    const subs = await res.json();

    const traderID = await isTraderRes.json();

    return {
      props: {
        subscriptions: subs,
        traderID: traderID.traderId || null,
        traders,
        disclaimer: disclaimer.msg,
      },
    };
  } else {
    return {
      props: {
        subscriptions: [],
        isTrader: false,
        traders,
        disclaimer: disclaimer.msg,
      },
    };
  }
}

export default Dashboard;
