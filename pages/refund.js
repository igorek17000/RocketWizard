import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Contact.module.scss";

import Alert from "../components/Alert";

function Refund() {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [traderID, setTraderID] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [display, setDisplay] = useState(false);

  const submit = async () => {
    const response = await fetch("/api/refund", {
      method: "POST",
      body: JSON.stringify({
        userEmail: email,
        traderId: traderID,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      setSuccess("Successfully refunded user.");
    } else {
      setError("There was an issue in the refund process.");
    }
  };

  const isOwner = async () => {
    const response = await fetch("/api/is-owner");

    const json = await response.json();

    if (json.isOwner) {
      setDisplay(true);
    }
  };

  useEffect(() => {
    isOwner();
  }, []);

  return (
    display && (
      <main className={styles.contact}>
        <Head>
          <title>Refund | Rocket Wizard</title>
          <meta name="description" content="Make money while sleeping" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <section className={styles.card}>
          <img src="/images/logo_light.svg" alt="Logo" />
          <div className={styles.nameEmail}>
            <div className={styles.inputContainer}>
              <label htmlFor="name">Email*</label>
              <input
                placeholder="you@example.com"
                type="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className={styles.inputContainer}>
              <label htmlFor="email">Trader ID*</label>
              <input
                placeholder="Traders ID"
                type="text"
                id="name"
                onChange={(e) => setTraderID(e.target.value)}
              />
            </div>
          </div>
          <div
            className={styles.inputContainer}
            style={{ width: "80%", marginTop: "2rem" }}
          >
            <label htmlFor="email">Password*</label>
            <input
              placeholder="Owner password"
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button style={{ marginTop: "5rem" }} onClick={submit}>
            SUBMIT
          </button>
          {error && <Alert text={error} error={true} />}
          {success && <Alert text={success} bgColor="#9dffaab9" />}
        </section>
      </main>
    )
  );
}

export default Refund;
