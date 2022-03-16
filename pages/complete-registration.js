import Link from "next/link";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Login.module.scss";
import { useSession, getSession, signIn, signOut } from "next-auth/react";

import { useRouter } from "next/router";

import Checkbox from "react-custom-checkbox";

import Alert from "../components/Alert";

import { useTheme } from "next-themes";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Oval } from "react-loader-spinner";

function CompleteRegistration() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [rememberMe, setRememberMe] = useState(false);

  const [password, setPassword] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const [hasPassword, setHasPassword] = useState(false);

  const { theme, setTheme } = useTheme();

  const { data: session } = useSession();

  const checkCredentials = () => {
    if (!password) {
      setPasswordError("All field are required.");
      return;
    }

    let passwordValid = password.length >= 8;

    setPasswordError(!passwordValid ? "Password is too short." : null);

    return passwordValid;
  };

  const loginUser = async () => {
    if (checkCredentials()) {
      if (session) {
        try {
          const result = await signIn("credentials", {
            redirect: false,
            name: session.user.name,
            email: session.user.email,
            password: password,
            replacePassword: true,
          });

          if (!result.error) {
            router.replace("/");
          } else {
            setPasswordError(result.error.replace("Error: ", ""));
          }
        } catch (error) {}
      } else {
        router.push("/");
      }
    }
  };

  useEffect(() => {
    if (hasPassword) {
      router.replace("/");
    } else {
      setLoading(false);
    }
  }, []);

  const getPasswordInfo = async () => {
    if (!session) return;

    const res = await fetch(
      `https://www.rocketwizard.io/api/auth/has-password`
    );

    const hasPasswordJson = await res.json();

    setHasPassword(hasPasswordJson);
  };

  useEffect(() => {
    getPasswordInfo();
  }, [session]);

  if (!theme) return null;

  return loading ? (
    <div className={styles.loadingContainer}>
      <Oval color="#731bde" secondaryColor="#a879e0" height={80} width={80} />
    </div>
  ) : (
    <div className={styles.loginContainer}>
      <Head>
        <title>Login | Rocket Wizard</title>
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
          <label htmlFor="password">Password</label>
          <input
            placeholder="Min. 8 characters"
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {passwordError && <Alert error={true} text={passwordError} />}
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
        </div>
        <button onClick={loginUser}>Complete Registration</button>
      </main>
    </div>
  );
}

export default CompleteRegistration;
