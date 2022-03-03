import React from "react";
import Link from "next/link";
import styles from "../styles/TraderCard.module.scss";

import { BsShieldFillCheck } from "react-icons/bs";

import ProgressBar from "./ProgressBar";

function TraderCard({ trader, isTrader }) {
  const getSubscribers = () => {
    const subscribers = trader.subscribers || [];

    const n = subscribers.length + trader.baseSubscribers;

    return `${n} subscriber${n !== 1 ? "s" : ""}`;
  };

  return (
    <main className={styles.traderCard}>
      {/* Header Section */}

      <section className={styles.header}>
        <div className={styles.pfpShield}>
          <img
            className={styles.pfp}
            src={`/images/traders/pfps/${trader.id}.svg`}
            alt="Trader pfp"
          />
          <BsShieldFillCheck className={styles.shield} />
        </div>
        <h3>{trader.name}</h3>
        <h4>{getSubscribers()}</h4>
        <p>{trader.username}</p>
      </section>

      {/* Body Section */}

      <section className={styles.body}>
        <div className={styles.exchange}>
          <img
            src={`/images/settings/exchanges/${trader.exchange}.svg`}
            alt="Exchange"
          />
        </div>
        <div className={styles.roi}>
          <h3>Last Month ROI</h3>
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
        <div className={styles.roi}>
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
        <div className={styles.winrate}>
          <h3>Winrate</h3>
          <h2>{trader.winrate}%</h2>
          <ProgressBar
            progress={trader.winrate}
            bgColor="#F2EAFB"
            fillColor="#731BDE"
          />
        </div>
        {isTrader ? (
          <Link href={`/traders/${trader.id}`}>
            <button className={styles.editBtn}>Edit profile details</button>
          </Link>
        ) : (
          <div className={styles.buttons}>
            <Link href={`/traders/${trader.id}`}>
              <button className={styles.viewMoreBtn}>View more</button>
            </Link>
            <Link href={`/traders/subscribe/${trader.id}`}>
              <button>Subscribe</button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default TraderCard;
