import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Settings.module.scss";

import { useSession } from "next-auth/react";

import { Scrollbar } from "react-scrollbars-custom";

import AddApi from "../components/AddApi";

/*
    {
      exchange: "binance",
      name: "ACHRAF25",
      api: "AJHC35JJSD5EHJDKNN",
    },
    {
      exchange: "okex",
      name: "SPARKY47",
      api: "AJHC35JJSD5EHJDKNN",
    },
    {
      exchange: "ftx",
      name: "DAVIDANDER124",
      api: "AJHC35JJSD5EHJDKNN",
    },
    {
      exchange: "binance",
      name: "ALLANBERRY",
      api: "AJHC35JJSD5EHJDKNN",
    },
    {
      exchange: "okex",
      name: "PETER145",
      api: "AJHC35JJSD5EHJDKNN",
    },
    {
      exchange: "okex",
      name: "PETER145",
      api: "AJHC35JJSD5EHJDKNN",
    },
    {
      exchange: "okex",
      name: "PETER145",
      api: "AJHC35JJSD5EHJDKNN",
    },
*/

function Settings() {
  const [openModal, setOpenModal] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);

  const { data: session, status } = useSession();

  const getApiKeys = async () => {
    if (!session) return;

    const res = await fetch(
      `https://rocket-wizard.vercel.app/api/apiKeys?email=${session.user.email}`
    );

    const keys = await res.json();

    setApiKeys(keys);
  };

  useEffect(() => {
    getApiKeys();
  }, []);

  return (
    <main className={styles.settings}>
      {openModal && (
        <AddApi
          open={openModal}
          handleClose={() => setOpenModal(false)}
          updateKeys={getApiKeys}
        />
      )}
      <Head>
        <title>Settings | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        <div className={styles.header}>
          <h1>Settings</h1>
        </div>
        <div className={styles.body}>
          <section className={styles.addApi}>
            <div className={styles.box}>
              <h3>Add API</h3>
              <p>
                API will let you control your exchanges and will be used to
                automate the trading process
              </p>
              <button onClick={() => setOpenModal(true)}>Add API</button>
            </div>
          </section>
          <section className={styles.apiList}>
            <h3>API list</h3>
            <Scrollbar style={{ height: "22.2rem" }}>
              {apiKeys.length > 0 ? (
                <div className={styles.list}>
                  {apiKeys.map((api, i) => (
                    <div className={styles.api} key={i}>
                      <div className={styles.values}>
                        <h4>{api.name}</h4>
                        <h4>{api.api}</h4>
                      </div>
                      <img
                        src={`/images/settings/exchanges/${api.exchange}.svg`}
                        alt="Exchange"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <h1>{"You didn't add any API keys yet."}</h1>
              )}
            </Scrollbar>
          </section>
        </div>
      </section>
    </main>
  );
}

export default Settings;
