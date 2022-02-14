import React from "react";
import Head from "next/head";
import styles from "../styles/NotFound.module.scss";

function NotFound() {
  return (
    <main className={styles.main}>
      <Head>
        <title>Page Not Found | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>404</h1>
      <p>Page Not Found</p>
    </main>
  );
}

export default NotFound;
