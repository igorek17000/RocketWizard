import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/Subscription.module.scss";

import Alert from "../Alert";

function Subscription({ subscription, openRenew, openUpgrade }) {
  const [subs] = useState([
    { name: "Basic", color: "#39E694" },
    { name: "Advanced", color: "#BA62EB" },
    { name: "Professional", color: "#731BDE" },
  ]);
  const [remainingDays, setRemainingDays] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const percentageRef = useRef(null);

  const getPercentage = async () => {
    const res = await fetch(
      `/api/wallet-percentage?traderId=${subscription.traderId}`
    );

    const json = await res.json();

    percentageRef.current.value = json.percentage;
  };

  const updatePercentage = async () => {
    const res = await fetch("/api/wallet-percentage", {
      method: "POST",
      body: JSON.stringify({
        traderId: subscription.traderId,
        percentage: parseFloat(percentageRef.current.value),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.status === 200) {
      setSuccess("Successfully changed subscription percentage!");
      setError(null);
    } else {
      setSuccess(null);
      setError(
        "There was an error while trying to update your subscription percentage."
      );
    }
  };

  useEffect(() => {
    let start = new Date();
    let end = new Date(subscription.plan.end);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingDays(diffDays);

    getPercentage();
  }, []);

  useEffect(() => {
    let timeout;
    if (success) {
      timeout = setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } else if (error) {
      timeout = setTimeout(() => {
        setError(null);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [success, error]);

  return (
    <main
      className={styles.subscription}
      style={{
        border: `3px solid ${
          subscription.disabled ? "#e96d69" : subs[subscription.plan.id].color
        }`,
        boxShadow: subscription.disabled ? " 0 0 10px #e96d69" : undefined,
      }}
    >
      <section className={styles.content}>
        <section className={styles.left}>
          <div className={styles.info}>
            <h4>{subs[subscription.plan.id].name}</h4>
            <p>
              {remainingDays} day{remainingDays > 1 && "s"} remaining
            </p>
          </div>
          <div className={styles.percentage}>
            <label>Wallet %</label>
            <div className={styles.inputButton}>
              <input type="number" ref={percentageRef} />

              <button
                style={{
                  backgroundColor: "#e96d69",
                }}
                onClick={updatePercentage}
              >
                Update
              </button>
            </div>
          </div>

          {/*
          {subscription.disabled && subscription.plan.id !== subs.length - 1 ? (
            <button
              style={{
                backgroundColor: "#e96d69",
              }}
              onClick={() => openUpgrade(subscription)}
            >
              Upgrade
            </button>
          ) : (

                  <button
                    style={{
                      backgroundColor: subs[subscription.plan.id].color,
                    }}
                    onClick={() => openRenew(subscription)}
                  >
                    Renew subscription
                  </button>

          )}
          */}
        </section>
        <section className={styles.right}>
          <h3>
            ${subscription.plan.price}
            <span>/month</span>
          </h3>
        </section>
      </section>
      {error && <Alert text={error} error={true} />}
      {success && <Alert text={success} bgColor="#9dffaab9" />}
      {subscription.disabled && (
        <Alert
          text={`Wallet balance is too high. Please${
            subscription.plan.id !== subs.length - 1 ? " upgrade or" : ""
          } reduce your wallet balance.`}
          error={true}
        />
      )}
      {subscription.lowbalance && (
        <Alert
          text={`Your wallet amount is too low for your subscription. Minimum wallet amount for trading with ${
            subscription.traderId
          } is $${
            subscription.traderId === "david" ? 280 : 400
          }. Please increase your wallet balance to continue copytrading.`}
          error={true}
        />
      )}
    </main>
  );
}

export default Subscription;
