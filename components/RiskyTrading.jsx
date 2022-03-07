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
        The trader currently has access to use 6% of your wallet per position.
        By enabling The Multiplier, that percentage gets multiplied by the
        amount specified.
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
      {selected && <h4>{walletPercentage * selected}% per position</h4>}
    </main>
  );
}

export default RiskyTrading;
