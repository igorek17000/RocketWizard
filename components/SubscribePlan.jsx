import React, { useState } from "react";
import Link from "next/link";
import styles from "../styles/SubscribePlan.module.scss";
import { useSession } from "next-auth/react";

function SubscribePlan({ id, trader }) {
  const centRound = (val) => {
    if (val % 10 > 6 || val % 10 === 0) {
      return Math.ceil(val / 10) * 10 - 0.01;
    } else {
      return Math.floor(val / 10) * 10 + 5.99;
    }
  };

  const { data: session } = useSession();

  const [priceMultipliers] = useState([1, 1.6, 1.75]);

  const getPrice = () => {
    let price = trader.basePrice;

    if (id !== 0) {
      price =
        priceMultipliers[id] * (trader.basePrice * priceMultipliers[id - 1]);
    }

    return centRound(price).toLocaleString("en-US");
  };

  const [comingSoon] = useState({
    binance: ["ADVANCED", "PRO"],
    kucoin: ["BASIC", "ADVANCED", "PRO"],
    okex: ["PRO"],
    huobi: ["BASIC", "ADVANCED", "PRO"],
  });

  const [plans] = useState([
    {
      name: "BASIC",
      walletFrom: 0,
      walletTo: 2500,
      leveragedPositions: 60000,
      planColor: "#00fd96",
    },
    {
      name: "ADVANCED",
      walletFrom: 2500,
      walletTo: 10000,
      leveragedPositions: 300000,
      planColor: "#BA62EB",
    },
    {
      name: "PRO",
      walletFrom: 10000,
      walletTo: 25000,
      leveragedPositions: 750000,
      planColor: "#7605FF",
    },
  ]);

  const [plan] = useState(plans[id]);

  return (
    <main
      className={styles.subscribePlan}
      style={{
        opacity: comingSoon[trader.exchange].includes(plan.name) ? 0.6 : 1,
      }}
    >
      {/* Top section */}

      <section className={styles.top}>
        <div className={styles.price}>
          <h1 className={styles.dollarSign}>$</h1>
          <h1>{getPrice()}</h1>
        </div>
        <h3>Monthly package</h3>
        <h5 style={{ backgroundColor: plan.planColor }}>{plan.name}</h5>
      </section>

      {/* Details section */}

      <section className={styles.details}>
        <p>
          <span>Access to</span> {trader.name} Services
        </p>
        <p>
          <span>For wallets</span> up to {plan.walletTo.toLocaleString("en-US")}
          $
        </p>
        <p>
          <span>Up to</span> {plan.leveragedPositions.toLocaleString("en-US")}$
          in leveraged positions
        </p>
      </section>

      {/* Bottom section */}

      <section className={styles.bottom}>
        <p>24/7 Live Support Chat</p>
        {comingSoon[trader.exchange].includes(plan.name) ? (
          <h3 className={styles.comingSoon}>COMING SOON</h3>
        ) : (
          <Link
            href={session ? `/checkout?p=${id}&q=1&t=${trader.id}` : "/login"}
          >
            <button>GET STARTED</button>
          </Link>
        )}
      </section>
    </main>
  );
}

export default SubscribePlan;
