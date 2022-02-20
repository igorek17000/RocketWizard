import React, { useState } from "react";
import Link from "next/link";
import styles from "../styles/SubscribePlan.module.scss";

function SubscribePlan({ id, trader }) {
  const [plans] = useState([
    {
      price: 129.99,
      name: "BASIC",
      walletFrom: 0,
      walletTo: 2500,
      leveragedPositions: 60000,
      planColor: "#00fd96",
    },
    {
      price: 220.99,
      name: "ADVANCED",
      walletFrom: 2500,
      walletTo: 10000,
      leveragedPositions: 300000,
      planColor: "#BA62EB",
    },
    {
      price: 330.99,
      name: "PRO",
      walletFrom: 10000,
      walletTo: 25000,
      leveragedPositions: 750000,
      planColor: "#7605FF",
    },
  ]);

  const [plan] = useState(plans[id]);

  return (
    <main className={styles.subscribePlan}>
      {/* Top section */}

      <section className={styles.top}>
        <div className={styles.price}>
          <h1 className={styles.dollarSign}>$</h1>
          <h1>{plan.price.toLocaleString("en-US")}</h1>
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
          <span>For wallets</span> between{" "}
          {plan.walletFrom.toLocaleString("en-US") +
            "-" +
            plan.walletTo.toLocaleString("en-US")}
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
        <Link href={`/checkout?p=${id}&q=1&t=${trader.id}`}>
          <button>GET STARTED</button>
        </Link>
      </section>
    </main>
  );
}

export default SubscribePlan;
