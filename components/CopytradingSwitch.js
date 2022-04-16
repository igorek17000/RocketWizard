import React, { useState, useEffect } from "react";
import styles from "../styles/CopytradingSwitch.module.scss";

export default function CopytradingSwitch() {
  const [copytrading, setCopytrading] = useState(true);

  const changeCopytradingStatus = async () => {
    const response = await fetch("/api/copytrading-status", {
      method: "POST",
      body: JSON.stringify({
        copytrading: !copytrading,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      setCopytrading(!copytrading);
    }
  };

  const getCopytradingStatus = async () => {
    const response = await fetch("/api/copytrading-status");

    if (response.status === 200) {
      const json = await response.json();

      setCopytrading(json.copytrading);
    }
  };

  useEffect(() => {
    getCopytradingStatus();
  }, []);

  return (
    <main className={styles.toggleContainer}>
      <p>Copytrading</p>
      <label className={styles.toggleSwitch}>
        <input
          type="checkbox"
          checked={copytrading}
          onChange={changeCopytradingStatus}
        />
        <span className={styles.switch} />
      </label>
    </main>
  );
}
