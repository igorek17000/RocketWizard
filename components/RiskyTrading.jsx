import React from "react";
import styles from "../styles/RiskyTrading.module.scss";

function RiskyTrading() {
  return (
    <main className={styles.risky}>
      <h3>Wallet Percentage</h3>
      <p>The trader will have access to use 7% of your wallet per position.</p>
    </main>
  );
}

export default RiskyTrading;
