import React, { useState, useEffect } from "react";
import styles from "../../styles/RoiCard.module.scss";

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

function RoiCard({ balance }) {
  const [timeframe, setTimeframe] = useState(options[0]);
  const [amountChange, setAmountChange] = useState(0);

  const [chartData, setChartData] = useState(balance.daily);

  const getPercentageChange = () => {
    let end = chartData[chartData.length - 1];
    let start = chartData[0];

    let change = end - start;

    setAmountChange(change);
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

  useEffect(() => {
    setChartData(balance.daily);
  }, [balance]);

  return (
    <main className={styles.roiCard}>
      <section className={styles.header}>
        <h4>Balance History</h4>
        <Select
          styles={customStyles}
          options={options}
          value={timeframe}
          onChange={changeTimeframe}
          defaultValue={timeframe}
        />
      </section>
      {chartData && chartData.length >= 5 ? (
        <section className={styles.body}>
          <div className={styles.values}>
            <h2 style={{ color: amountChange >= 0 ? "#39c491" : "#e96d69" }}>
              {amountChange >= 0 && "+"}
              {amountChange}
            </h2>
          </div>
          <div className={styles.graph}>
            <LineChart
              chartData={chartData}
              color={amountChange >= 0 ? "#39c491" : "#e96d69"}
            />
          </div>
        </section>
      ) : (
        <section className={styles.body}>
          <h3 className={styles.noData}>Not enough data</h3>
        </section>
      )}
    </main>
  );
}

export default RoiCard;
