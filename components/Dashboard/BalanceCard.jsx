import React, { useState } from "react";
import styles from "../../styles/BalanceCard.module.scss";

import Select from "react-select";

const options = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const customStyles = {
  control: () => ({
    // none of react-select's styles are passed to <Control />
    width: "100%",
    display: "flex",
    fontSize: "0.8rem",
    border: "1px solid black",
    borderRadius: 5,
  }),
  option: (provided, state) => ({
    ...provided,
    color: "black",
  }),
  menuList: (base) => ({
    ...base,

    "::-webkit-scrollbar": {
      width: "8px",
      height: "0px",
    },
    "::-webkit-scrollbar-track": {
      background: "#f1f1f1",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#888",
      borderRadius: 10,
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "#555",
    },
  }),
};

function BalanceCard() {
  const [timeframe, setTimeframe] = useState(options[0]);

  const changeTimeframe = (value) => {
    setTimeframe(value);
  };

  return (
    <main className={styles.balanceCard}>
      <section className={styles.header}>
        <h4>Total Balance</h4>
        <Select
          styles={customStyles}
          options={options}
          value={timeframe}
          onChange={changeTimeframe}
          defaultValue={timeframe}
        />
      </section>
      <section className={styles.body}>
        <div className={styles.values}>
          <h2>$1,534</h2>
          <p>+ 7%</p>
        </div>
        <div className={styles.graph}>
          <img src="/images/dashboard/balanceGraph.svg" alt="Balance icon" />
        </div>
      </section>
    </main>
  );
}

export default BalanceCard;
