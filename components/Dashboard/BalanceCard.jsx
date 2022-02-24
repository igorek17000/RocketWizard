import React, { useState, useEffect } from "react";
import styles from "../../styles/BalanceCard.module.scss";

import Select from "react-select";

import LineChart from "./LineChart";

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

function BalanceCard({ balance }) {
  const [timeframe, setTimeframe] = useState(options[0]);
  const [percentageChange, setPercentageChange] = useState(0);

  const [chartData, setChartData] = useState(balance.daily);

  const getPercentageChange = () => {
    let end = chartData[chartData.length - 1];
    let start = chartData[0];

    let change = (end / start - 1) * 100;

    setPercentageChange(Math.round(change * 100) / 100);
  };

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
    getPercentageChange();
  }, [chartData]);

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
          <h2>$4,321</h2>
          <p style={{ color: percentageChange > 0 ? "#39c491" : "#e96d69" }}>
            {percentageChange > 0 && "+"}
            {percentageChange}%
          </p>
        </div>
        <div className={styles.graph}>
          <LineChart
            chartData={chartData}
            color={percentageChange > 0 ? "#39c491" : "#e96d69"}
          />
        </div>
      </section>
    </main>
  );
}

export default BalanceCard;
