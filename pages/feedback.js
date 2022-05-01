import Head from "next/head";
import React, { useState, useMemo } from "react";
import styles from "../styles/Contact.module.scss";

import Select from "react-select";

import SubmissionSent from "../components/SubmissionSent";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";

function Feedback() {
  const [feedback, setFeedback] = useState(null);
  const [category, setCategory] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [fail, setFail] = useState(false);

  const options = [
    {
      value: "Payment",
      label: "Payment",
    },
    {
      value: "Security",
      label: "Security",
    },
    {
      value: "Order",
      label: "Order",
    },
    {
      value: "Traders",
      label: "Traders",
    },
  ];

  const { theme, setTheme } = useTheme();

  const changeCategory = (value) => {
    setCategory(value);
  };

  const customStyles = {
    control: () => ({
      // none of react-select's styles are passed to <Control />
      width: "100%",
      display: "flex",
      padding: "0.4rem 0.5rem",
      fontSize: "1rem",
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

  const checkValues = () => {
    return category && feedback;
  };

  const submit = async () => {
    const success = checkValues();

    if (success) {
      let data = {
        category: category.label,
        feedback,
      };

      fetch("/api/feedback", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.status === 200) {
          setCategory(null);
          setFeedback(null);
        }
      });
    }

    setFail(!success);
    setSubmitted(true);
  };

  return (
    <main className={styles.contact}>
      {submitted && (
        <SubmissionSent
          open={submitted}
          handleClose={() => setSubmitted(false)}
          error={fail}
        />
      )}
      <Head>
        <title>Feedback | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.div
        className={styles.motionDiv}
        transition={{ duration: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <section className={styles.card}>
          <img src="/images/logo_light.svg" alt="Logo" />
          <div className={`${styles.inputContainer} ${styles.category}`}>
            <label htmlFor="category">Category*</label>
            <Select
              className={styles.select}
              styles={customStyles}
              options={options}
              value={category}
              onChange={changeCategory}
              isSearchable={false}
            />
          </div>
          <div className={styles.message}>
            <div className={styles.inputContainer}>
              <label htmlFor="message">Feedback*</label>
              <textarea
                placeholder="Type your message"
                type="text"
                id="message"
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>
          <button onClick={submit}>SUBMIT</button>
        </section>
      </motion.div>
    </main>
  );
}

export default Feedback;
