import React, { useState } from "react";
import styles from "../../styles/StatisticsCard.module.scss";

import Select from "react-select";

const options = [
  { value: "daily", label: "Daily", description: "Last day" },
  { value: "weekly", label: "Weekly", description: "Last 7 days" },
  { value: "monthly", label: "Monthly", description: "Last 30 days" },
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

function StatisticsCard() {
  const [timeframe, setTimeframe] = useState(options[1]);

  const [timeframeTitles] = useState([
    "Last day",
    "Last 7 days",
    "Last 30 days",
  ]);

  const changeTimeframe = (value) => {
    setTimeframe(value);
  };

  return (
    <main className={styles.statisticsCard}>
      <section className={styles.header}>
        <div className={styles.title}>
          <h4>Statistics</h4>
          <p>{timeframe.description}</p>
        </div>
        <Select
          styles={customStyles}
          options={options}
          value={timeframe}
          onChange={changeTimeframe}
          defaultValue={timeframe}
        />
      </section>
      <section className={styles.body}>
        <img
          src="/images/dashboard/statisticsGraph.svg"
          alt="Statistics icon"
        />
        <button>SEE ALL</button>
      </section>
    </main>
  );
}

export default StatisticsCard;
