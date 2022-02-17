import React, { useState } from "react";
import styles from "../../styles/RoiCard.module.scss";

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

function RoiCard() {
  const [timeframe, setTimeframe] = useState(options[0]);

  const changeTimeframe = (value) => {
    setTimeframe(value);
  };

  return (
    <main className={styles.roiCard}>
      <section className={styles.header}>
        <h4>ROI</h4>
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
          <h2>+105%</h2>
        </div>
        <div className={styles.graph}>
          <img src="/images/dashboard/roiGraph.svg" alt="Balance icon" />
        </div>
      </section>
    </main>
  );
}

export default RoiCard;
