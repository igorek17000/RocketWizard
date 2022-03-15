import Head from "next/head";
import React from "react";
import styles from "../styles/UnderMaintenance.module.scss";

function UnderMaintenance() {
  return (
    <main className={styles.main}>
      <Head>
        <title>Rocket Wizard is under maintenance</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        <img src="/images/logo_light.svg" alt="Logo" />
        <h1>Rocket Wizard is currently under maintenance</h1>
        <p>
          Hello there! We are working on updating the website and it is
          currently under maintenance until further notice. Please be patient.
          We are working very hard to deploy the update as soon as possible!
        </p>
      </section>
    </main>
  );
}

export default UnderMaintenance;
