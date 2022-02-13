import Link from "next/link";
import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Login.module.scss";

import Checkbox from "react-custom-checkbox";

function Register() {
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className={styles.loginContainer}>
      <Head>
        <title>Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.login}>
        <img src="/images/logo.svg" alt="Logo" />
        <button className={styles.googleBtn}>
          <img src="/images/login/google.svg" alt="Icon of google" />
          Sign in with Google
        </button>
        <div className={styles.signInWithEmail}>
          <div className={styles.line} />
          <p>Or sign in with email</p>
          <div className={styles.line} />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="email">Email</label>
          <input placeholder="mail@website.com" type="email" id="email" />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="password">Password</label>
          <input
            placeholder="Min. 8 characters"
            type="password"
            id="password"
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            placeholder="**************"
            type="password"
            id="confirmPassword"
          />
        </div>
        <div className={styles.bottom}>
          <Checkbox
            checked={rememberMe}
            onChange={(val) => setRememberMe(val)}
            icon={
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  backgroundColor: "#731bde",
                  alignSelf: "stretch",
                  margin: "2px",
                  borderRadius: "3px",
                }}
              />
            }
            borderColor="#731bde"
            style={{ overflow: "hidden" }}
            size={20}
            label="Remember me"
          />
          <Link href="/login">Already registered?</Link>
        </div>
        <button>Register</button>
        <p>
          Already have an account?{" "}
          <span>
            <Link href="/login">Login</Link>
          </span>
        </p>
      </main>
    </div>
  );
}

export default Register;
