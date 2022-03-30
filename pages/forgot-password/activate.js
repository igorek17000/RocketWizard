import Link from "next/link";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../../styles/Login.module.scss";

import { useTheme } from "next-themes";

import { useRouter } from "next/router";

function Activate({ success }) {
  const router = useRouter();

  const { theme, setTheme } = useTheme();

  if (!theme) return null;

  return (
    <div className={styles.loginContainer}>
      <Head>
        <title>Forgot Password | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.login}>
        <img
          src={`/images/${
            theme === "dark" ? "logo_dark.svg" : "logo_light.svg"
          }`}
          alt="Logo"
        />
        {success ? (
          <>
            {" "}
            <h3>Your password has been reset!</h3>
            <Link href="/login">
              <button>Login</button>
            </Link>
          </>
        ) : (
          <h3>
            Sorry, but we were unable to reset your password. Please contact
            customer service and stay patient.
          </h3>
        )}

        <p>
          Not registered yet?{" "}
          <span>
            <Link href="/register">Create an account</Link>
          </span>
        </p>
      </main>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  const { id, email } = query;

  const res = await fetch(
    `https://www.rocketwizard.io/api/auth/activate-password?e=${email}&c=${id}`
  );

  return { props: { success: res.status === 200, email, id } };
}

export default Activate;
