import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/Subscription.module.scss";

import SubAlert from "../SubAlert";

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

function Subscription({
  traders,
  subscription,
  openRenew,
  openUpgrade,
  refresh,
}) {
  const [subs] = useState([
    { name: "Basic", color: "#39E694" },
    { name: "Advanced", color: "#BA62EB" },
    { name: "Professional", color: "#731BDE" },
  ]);
  const [remainingDays, setRemainingDays] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [themeColor, setThemeColor] = useState(null);
  const [fullPrice, setFullPrice] = useState(null);

  const [priceMultipliers] = useState([1, 1.6, 1.75]);

  const percentageRef = useRef(null);

  const centRound = (val) => {
    if (val % 10 > 6 || val % 10 === 0) {
      return Math.ceil(val / 10) * 10 - 0.01;
    } else {
      return Math.floor(val / 10) * 10 + 5.99;
    }
  };

  const getPrice = async () => {
    if (!traders) return 0;

    const trader = await traders.find(
      (trader) => trader.id == subscription.traderId
    );

    let price = trader ? trader.basePrice : 0;

    let id = subscription.plan.id;

    if (parseInt(id) !== 0) {
      price =
        priceMultipliers[id] *
        centRound(trader.basePrice * priceMultipliers[id - 1]);
    }

    const planPriceTemp = Math.max(centRound(price), 0).toLocaleString("en-US");

    setFullPrice(centRound(planPriceTemp));
  };

  useEffect(() => {
    getPrice();
  }, []);

  useEffect(() => {
    setThemeColor(subs[subscription.plan.id].color);
  }, [subscription]);

  const getPercentage = async () => {
    const res = await fetch(
      `/api/wallet-percentage?traderId=${subscription.traderId}`
    );

    const json = await res.json();

    percentageRef.current.value = json.percentage;
  };

  const updatePercentage = async () => {
    if (percentageRef.current.value > 7) {
      setSuccess(null);
      setError("Percentage cannot be over 7%");
      return;
    }

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

  const changeSubPausedState = async () => {
    const res = await fetch("/api/update-pause-status", {
      method: "POST",
      body: JSON.stringify({
        paused: subscription.paused ? !subscription.paused : true,
        traderId: subscription.traderId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    refresh();

    if (!(res.status === 200)) {
      setSuccess(null);
      setError("Server is busy. Please try again later.");
    }
  };

  useEffect(() => {
    let start = new Date();
    let end = new Date(subscription.plan.end);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingDays(diffDays);

    if (!subscription.disabled) getPercentage();
  }, []);

  useEffect(() => {
    let timeout;
    if (success) {
      setThemeColor("#43DE6C");

      timeout = setTimeout(() => {
        setSuccess(null);
        setThemeColor(subs[subscription.plan.id].color);
      }, 3000);
    } else if (error) {
      setThemeColor("#FF4848");

      timeout = setTimeout(() => {
        setThemeColor(subs[subscription.plan.id].color);
        setError(null);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [success, error]);

  return (
    <main
      className={styles.subscription}
      style={{
        border: `3px solid ${subscription.disabled ? "#e96d69" : themeColor}`,
        boxShadow: subscription.disabled ? " 0 0 10px #e96d69" : undefined,
      }}
    >
      {subscription.paused && (
        <section className={styles.pauseScreen}>
          <h3>PAUSED</h3>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={!subscription.paused}
              onChange={changeSubPausedState}
            />
            <span className={styles.switch} />
          </label>
        </section>
      )}

      <section className={styles.content}>
        {/* Top section */}
        <section className={styles.top}>
          <div className={styles.info}>
            <h4 style={(error || success) && { color: themeColor }}>
              {capitalize(subscription.traderId)}{" "}
              {subs[subscription.plan.id].name}
            </h4>
            <p>
              {remainingDays} day{remainingDays > 1 && "s"} remaining
            </p>
          </div>

          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={!subscription.paused}
              onChange={changeSubPausedState}
            />
            <span className={styles.switch} />
          </label>
        </section>

        {/* Mid section */}
        <section className={styles.mid}>
          <button
            style={{
              backgroundColor: themeColor,
            }}
            onClick={() => openRenew(subscription)}
          >
            Renew
          </button>
          {1 === 2 && (
            <button
              style={{
                backgroundColor: themeColor,
              }}
              onClick={() => openUpgrade(subscription)}
            >
              Upgrade
            </button>
          )}
        </section>

        {/* Bottom section */}
        <section className={styles.bottom}>
          <div className={styles.percentage}>
            <label>Maximum wallet %</label>
            <div className={styles.inputButton}>
              <input type="number" ref={percentageRef} max={7} />

              <button
                style={{
                  backgroundColor: themeColor,
                }}
                onClick={updatePercentage}
              >
                Update
              </button>
            </div>
          </div>
          <h3>
            ${fullPrice}
            <span>/month</span>
          </h3>
        </section>
        {error && <SubAlert text={error} error={true} />}
        {success && <SubAlert text={success} />}
        {subscription.disabled && (
          <SubAlert
            text={`Wallet balance is too high. Please${
              subscription.plan.id !== subs.length - 1 ? " upgrade or" : ""
            } reduce your wallet balance.`}
            error={true}
          />
        )}
        {subscription.lowbalance && (
          <SubAlert
            text={`Your wallet amount is too low for your subscription. Minimum wallet amount for trading with ${
              subscription.traderId
            } is $${
              subscription.traderId === "david" ? 280 : 300
            }. Please increase your wallet balance to continue copytrading.`}
            error={true}
          />
        )}
      </section>

      {/* 

      <section className={styles.content}>
        <section className={styles.left}>
          <div className={styles.info}>
            <h4>
              {capitalize(subscription.traderId)}{" "}
              {subs[subscription.plan.id].name}
            </h4>
            <p>
              {remainingDays} day{remainingDays > 1 && "s"} remaining
            </p>
          </div>
          {!subscription.disabled && (
            <div className={styles.percentage}>
              <label>Wallet %</label>
              <div className={styles.inputButton}>
                <input type="number" ref={percentageRef} max={7} />

                <button
                  style={{
                    backgroundColor: themeColor,
                  }}
                  onClick={updatePercentage}
                >
                  Update
                </button>
              </div>
            </div>
          )}
          {subscription.disabled ? (
            <>
              {subscription.plan.id !== subs.length - 1 && 1 === 2 ? (
                <button
                  style={{
                    backgroundColor: "#e96d69",
                  }}
                  onClick={() => openUpgrade(subscription)}
                >
                  Upgrade
                </button>
              ) : null}
            </>
          ) : (
            <button
              style={{
                backgroundColor: themeColor,
              }}
              onClick={() => openRenew(subscription)}
            >
              Renew subscription
            </button>
          )}
        </section>
        <section className={styles.right}>
          <h3>
            ${fullPrice}
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
            subscription.traderId === "david" ? 280 : 300
          }. Please increase your wallet balance to continue copytrading.`}
          error={true}
        />
      )}
        */}
    </main>
  );
}

export default Subscription;
