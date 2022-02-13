import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/Login.module.scss";

import Checkbox from "react-custom-checkbox";

function Login() {
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className={styles.loginContainer}>
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
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <button>Register</button>
        <p>
          Not registered yet?{" "}
          <span>
            <Link href="/signup">Create an account</Link>
          </span>
        </p>
      </main>
    </div>
  );
}

export default Login;
