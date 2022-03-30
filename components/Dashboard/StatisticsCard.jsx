import React, { useState, useEffect } from "react";
import styles from "../../styles/StatisticsCard.module.scss";

import Select from "react-select";

import LineChart from "./LineChart";

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

function StatisticsCard({ balance, forceExtra = 20 }) {
  const [timeframe, setTimeframe] = useState(options[1]);

  const [chartData, setChartData] = useState(balance.weekly);

  const changeTimeframe = (value) => {
    setTimeframe(value);

    if (value.value === "daily") {
      setChartData(balance.daily);
    } else if (value.value === "weekly") {
      setChartData(balance.weekly);
    } else {
      setChartData(balance.monthly);
    }
  };

  useEffect(() => {
    setChartData(balance.weekly);
    setTimeframe(options[1]);
  }, [balance]);

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
          isSearchable={false}
        />
      </section>
      {chartData && chartData.length >= 5 ? (
        <section className={styles.body}>
          <LineChart
            chartData={chartData}
            color="#731bde"
            extra={forceExtra}
            aspectRatio={null}
          />
          <button>SEE ALL</button>
        </section>
      ) : (
        <section className={styles.body}>
          <h3 className={styles.noData}>Not enough data</h3>
        </section>
      )}
    </main>
  );
}

export default StatisticsCard;
