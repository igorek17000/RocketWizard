import React, { useState, useEffect } from "react";
import styles from "../../styles/Subscription.module.scss";

import Alert from "../Alert";

function Subscription({ subscription, openRenew, openUpgrade }) {
  const [subs] = useState([
    { name: "Basic", color: "#39E694" },
    { name: "Advanced", color: "#BA62EB" },
    { name: "Professional", color: "#731BDE" },
  ]);
  const [remainingDays, setRemainingDays] = useState(null);

  useEffect(() => {
    let start = new Date();
    let end = new Date(subscription.plan.end);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingDays(diffDays);
  }, []);

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
        </section>
        <section className={styles.right}>
          <h3>
            ${subscription.plan.price}
            <span>/month</span>
          </h3>
        </section>
      </section>
      {subscription.disabled && (
        <Alert
          text={`Wallet balance is too high. Please${
            subscription.plan.id !== subs.length - 1 ? " upgrade or" : ""
          } reduce your wallet balance.`}
          error={true}
        />
      )}
    </main>
  );
}

export default Subscription;
