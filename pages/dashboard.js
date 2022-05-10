import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Dashboard.module.scss";

import { useSession, getSession } from "next-auth/react";

import { BsDiscord } from "react-icons/bs";

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
import CodeOwnerDashboard from "../components/Dashboard/CodeOwnerDashboard";
import Renew from "../components/Renew";
import Upgrade from "../components/Upgrade";
import Alert from "../components/Alert";
import { motion } from "framer-motion";

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

function Dashboard({ traders, disclaimer }) {
  const [api, setApi] = useState(null);
  const [options, setOptions] = useState([]);

  const [renewOpen, setRenewOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const [subscriptions, setSubscriptions] = useState(null);
  const [deals, setDeals] = useState([]);

  const [traderID, setTraderID] = useState(null);
  const [codeOwner, setCodeOwner] = useState(null);

  const [taken, setTaken] = useState(false);

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

    const takenRes = await fetch(
      `https://www.rocketwizard.io/api/is-taken?email=${session.user.email}&apiName=${value.value}`
    );

    const balancejson = await res.json();

    const takenjson = await takenRes.json();

    console.log(takenjson);

    setBalance(balancejson);
    setTaken(takenjson.taken);
  };

  const getInfo = async () => {
    if (!session) return;

    const res = await fetch(`https://www.rocketwizard.io/api/subscribe`);

    const dealsRes = await fetch(`https://www.rocketwizard.io/api/deals`);

    const isTraderRes = await fetch(`https://www.rocketwizard.io/api/isTrader`);

    const codeRes = await fetch(
      `https://www.rocketwizard.io/api/is-code-owner`
    );

    const subsJson = await res.json();

    const dealsJson = await dealsRes.json();

    const traderIDJson = await isTraderRes.json();

    const codeOwnerJson = await codeRes.json();

    setDeals(dealsJson);
    setSubscriptions(subsJson);
    setTraderID(traderIDJson.traderId);
    setCodeOwner(codeOwnerJson.code);
  };

  const getAPIs = async () => {
    if (session) {
      const res = await fetch(`https://www.rocketwizard.io/api/apiKeys`);

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
    options && subscriptions && setLoading(false);
  }, [options, subscriptions]);

  useEffect(() => {
    getAPIs();
    getInfo();
  }, [session]);

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
          apiName={subscription.apiName}
        />
      )}
      {subscription && subscription.plan.id < 2 && (
        <Upgrade
          open={upgradeOpen}
          handleClose={() => setUpgradeOpen(false)}
          traders={traders}
          id={subscription.plan.id + 1}
          traderId={subscription.traderId}
          apiName={subscription.apiName}
          endDate={subscription.plan.end}
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
            <>
              {codeOwner ? (
                <CodeOwnerDashboard code={codeOwner} />
              ) : (
                <section className={styles.card}>
                  <section className={styles.left}>
                    <motion.div
                      className={styles.motionDiv}
                      transition={{ duration: 0.5 }}
                      initial={{ opacity: 0 }}
                      animate={!loading ? { opacity: 1 } : ""}
                    >
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
                              isSearchable={false}
                            />
                          )}
                        </div>

                        {api ? (
                          <motion.div
                            className={styles.motionDiv}
                            transition={{ duration: 0.5 }}
                            initial={{ opacity: 0 }}
                            animate={api ? { opacity: 1 } : ""}
                          >
                            <div className={styles.body}>
                              {taken && (
                                <div className={styles.discord}>
                                  <BsDiscord fill="#4e388" />
                                  <p>
                                    <a
                                      href="/api/discord/auth"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Join the Discord
                                    </a>
                                  </p>
                                </div>
                              )}

                              <div className={styles.balanceRoiCards}>
                                <BalanceCard apiName={api.value} />
                                <RoiCard balance={balance} />
                              </div>
                              <StatisticsCard balance={balance} />
                              <Alert
                                error={true}
                                text={disclaimer}
                                fontSize="1.4rem"
                              />
                            </div>
                          </motion.div>
                        ) : (
                          <div className={styles.body}>
                            <div className={styles.noApi}>
                              <h3>
                                Connect an API to access the dashboard data
                              </h3>
                              <Select
                                className={styles.select}
                                styles={customStyles}
                                options={options}
                                value={api}
                                onChange={changeApi}
                                isSearchable={false}
                              />
                            </div>
                          </div>
                        )}
                      </section>
                    </motion.div>
                    <motion.div
                      className={styles.motionDiv}
                      transition={{ duration: 0.5 }}
                      initial={{ opacity: 0 }}
                      animate={!loading ? { opacity: 1 } : ""}
                    >
                      <section className={styles.deals}>
                        <h2>My deals</h2>
                        <div className={styles.dealList}>
                          {deals.map((deal, i) => (
                            <Deal deal={deal} refreshDeals={getInfo} key={i} />
                          ))}
                        </div>
                      </section>
                    </motion.div>
                  </section>

                  <section className={styles.right}>
                    <motion.div
                      className={styles.motionDiv}
                      transition={{ duration: 0.5 }}
                      initial={{ opacity: 0 }}
                      animate={!loading ? { opacity: 1 } : ""}
                    >
                      <h2>My Subscriptions</h2>
                      <div className={styles.subscriptionList}>
                        {subscriptions.map((subscription, i) => (
                          <Subscription
                            traders={traders}
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
                            refresh={getInfo}
                          />
                        ))}
                      </div>
                    </motion.div>
                  </section>
                </section>
              )}
            </>
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

  return {
    props: {
      traders,
      disclaimer: disclaimer.msg,
    },
  };
}

export default Dashboard;
