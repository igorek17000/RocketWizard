import Link from "next/link";
import Head from "next/head";
import React, { useState } from "react";
import styles from "../../styles/Login.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";

import { useRouter } from "next/router";

import Alert from "../../components/Alert";

import { useTheme } from "next-themes";

function Login() {
  const router = useRouter();

  const [email, setEmail] = useState(null);
  const [success, setSuccess] = useState(null);
  const [password, setPassword] = useState(null);

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const { theme, setTheme } = useTheme();

  const { data: session } = useSession();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const checkCredentials = () => {
    if (!(email && password)) {
      setPasswordError("All field are required.");
      return;
    }

    let emailValid = validateEmail(email);
    let passwordValid = password.length >= 8;

    setEmailError(!emailValid ? "Invalid email address." : null);
    setPasswordError(!passwordValid ? "Password is too short." : null);

    return emailValid && passwordValid;
  };

  const resetPassword = async () => {
    if (checkCredentials()) {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          newPassword: password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      setSuccess("We send you the link to reset your password on your email.");
    }
  };

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
        <div className={styles.inputContainer}>
          <label htmlFor="email">Email</label>
          <input
            placeholder="mail@website.com"
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {emailError && <Alert error={true} text={emailError} />}
        <div className={styles.inputContainer}>
          <label htmlFor="password">New Password</label>
          <input
            placeholder="Min. 8 characters"
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {passwordError && <Alert error={true} text={passwordError} />}
        {success && <Alert text={success} bgColor="#9dffaab9" />}
        <button onClick={resetPassword}>Reset password</button>
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

export default Login;
