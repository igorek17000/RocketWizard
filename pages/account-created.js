import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/AccCreated.module.scss";

import { useTheme } from "next-themes";

function AccCreated() {
  const [celebrationSrc, setCelebrationSrc] = useState("celebration_light.svg");

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setCelebrationSrc(
      theme === "dark" ? "celebration_dark.svg" : "celebration_light.svg"
    );
  }, [theme]);

  return (
    <main className={styles.accCreated}>
      <Head>
        <title>Account Created | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Welcome!</h1>
      <img src="/images/accCreated/stages.svg" alt="Stages" />
      <h2>Account successfully created</h2>
      <img
        className={styles.celebration}
        src={`/images/accCreated/${celebrationSrc}`}
        alt="Celebrating"
      />
      <Link href="/login">
        <button>LOGIN NOW</button>
      </Link>
    </main>
  );
}

export default AccCreated;
