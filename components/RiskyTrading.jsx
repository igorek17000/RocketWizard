import React, { useState, useEffect } from "react";
import styles from "../styles/RiskyTrading.module.scss";

function RiskyTrading({ sendSelected }) {
  const [walletPercentage] = useState(6);

  const [multipliers] = useState([1.5, 2, 2.25, 2.5]);

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    sendSelected(selected || 1);
  }, [selected]);

  return (
    <main className={styles.risky}>
      <h3>Risky Trading</h3>
      <p>
        Currently, the trader will have access to only {walletPercentage}% of
        your wallet. By enabling Risky Trading, that percentage gets multiplied
        by the amount specified below.
      </p>
      <div className={styles.buttons}>
        {multipliers.map((multiplier, i) => (
          <button
            key={i}
            style={
              selected === multiplier ? { backgroundColor: "red" } : undefined
            }
            onClick={() =>
              setSelected(selected === multiplier ? null : multiplier)
            }
          >
            {multiplier}X
          </button>
        ))}
      </div>
      {selected && (
        <h4>Trader will have access to: {walletPercentage * selected}%</h4>
      )}
    </main>
  );
}

export default RiskyTrading;
