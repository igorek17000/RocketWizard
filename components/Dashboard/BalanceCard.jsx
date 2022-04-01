import React, { useState, useEffect } from "react";
import styles from "../../styles/BalanceCard.module.scss";
import { Oval } from "react-loader-spinner";

import { useSession } from "next-auth/react";

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

function BalanceCard({ apiName }) {
  const [loading, setLoading] = useState(true);

  const [currBalance, setCurrBalance] = useState(null);

  const { data: session, status } = useSession();

  const getCurrBalance = async () => {
    const balanceResponse = await fetch("/api/get-balance", {
      method: "POST",
      body: JSON.stringify({
        email: session.user.email,
        apiName,
        exists: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const balance = await balanceResponse.json();

    setCurrBalance(balance.balance);

    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getCurrBalance();
  }, [apiName]);

  return (
    <main className={styles.balanceCard}>
      <section className={styles.header}>
        <h4>Current Balance</h4>
      </section>
      {currBalance !== null && currBalance !== undefined && !loading ? (
        <section className={styles.body}>
          <div className={styles.values}>
            <h2>${Math.round(currBalance * 100) / 100}</h2>
          </div>
        </section>
      ) : (
        <section
          className={styles.body}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <Oval
            color="#731bde"
            secondaryColor="#a879e0"
            height={80}
            width={80}
          />
        </section>
      )}
    </main>
  );
}

export default BalanceCard;
