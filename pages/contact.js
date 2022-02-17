import Head from "next/head";
import React, { useState, useMemo } from "react";
import styles from "../styles/Contact.module.scss";

import Select from "react-select";
import countryList from "react-select-country-list";

import SubmissionSent from "../components/SubmissionSent";

import { useTheme } from "next-themes";

function Contact() {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [company, setCompany] = useState(null);
  const [message, setMessage] = useState(null);
  const [country, setCountry] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [fail, setFail] = useState(false);

  const options = useMemo(() => countryList().getData(), []);

  const { theme, setTheme } = useTheme();

  const changeCountry = (value) => {
    setCountry(value);
  };

  const customStyles = {
    control: () => ({
      // none of react-select's styles are passed to <Control />
      width: "100%",
      display: "flex",
      padding: "0.4rem 0.5rem",
      fontSize: "1rem",
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

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const checkValues = () => {
    return name && email && validateEmail(email) && country && message;
  };

  const submit = () => {
    setFail(!checkValues());
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
        <title>Contact Us | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        <img src="/images/logo_light.png" alt="Logo" />
        <div className={styles.nameEmail}>
          <div className={styles.inputContainer}>
            <label htmlFor="name">Your name*</label>
            <input
              placeholder="Your name"
              type="text"
              id="name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="email">Contact email*</label>
            <input
              placeholder="you@example.com"
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.companyCountry}>
          <div className={styles.inputContainer}>
            <label htmlFor="company">Company name</label>
            <input
              placeholder="Company name"
              type="text"
              id="company"
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="country">Country*</label>
            <Select
              className={styles.select}
              styles={customStyles}
              options={options}
              value={country}
              onChange={changeCountry}
            />
          </div>
        </div>
        <div className={styles.message}>
          <div className={styles.inputContainer}>
            <label htmlFor="message">Your message*</label>
            <textarea
              placeholder="Type your message"
              type="text"
              id="message"
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <button onClick={submit}>SUBMIT</button>
      </section>
    </main>
  );
}

export default Contact;
