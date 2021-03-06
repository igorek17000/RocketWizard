import Link from "next/link";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Login.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";

import { useRouter } from "next/router";

import Checkbox from "react-custom-checkbox";

import Alert from "../components/Alert";

import { useTheme } from "next-themes";

function Register() {
  const router = useRouter();

  const [rememberMe, setRememberMe] = useState(false);
  const [readTerms, setReadTerms] = useState(false);

  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

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
    if (!(email && password && confirmPassword)) {
      setConfirmPasswordError("All field are required.");
      return;
    } else if (!readTerms) {
      setConfirmPasswordError(
        "Please agree to terms and conditions before placing the order."
      );
      return;
    }

    let emailValid = validateEmail(email);
    let passwordValid = password.length >= 8;
    let confirmPasswordValid = confirmPassword === password;

    setEmailError(!emailValid ? "Invalid email address." : null);
    setPasswordError(!passwordValid ? "Password is too short." : null);
    setConfirmPasswordError(
      !confirmPasswordValid ? "Password don't match." : null
    );

    return emailValid && passwordValid && confirmPasswordValid;
  };

  const registerUser = async () => {
    if (checkCredentials()) {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: email.substring(0, email.indexOf("@")),
            email: email,
            password: password,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();

        if (!response.ok) {
          setConfirmPasswordError(json.message);
          throw new Error(json.message || "Something went wrong");
        }

        router.replace("/account-created");
      } catch (error) {}
    }
  };

  const [logoSrc, setLogoSrc] = useState("logo_light.svg");

  useEffect(() => {
    setLogoSrc(theme === "dark" ? "logo_dark.svg" : "logo_light.svg");
  }, [theme]);

  return theme ? (
    <div className={styles.loginContainer}>
      <Head>
        <title>Register | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.login}>
        <img src={`/images/${logoSrc}`} alt="Logo" />
        <button
          className={styles.googleBtn}
          onClick={() =>
            signIn("google", { callbackUrl: "/complete-registration" })
          }
        >
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
          <input
            placeholder="mail@website.com"
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {emailError && <Alert error={true} text={emailError} />}
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
        <div className={styles.inputContainer}>
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            placeholder="**************"
            type="password"
            id="confirmPassword"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {confirmPasswordError && (
          <Alert error={true} text={confirmPasswordError} />
        )}
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
            labelStyle={{
              marginLeft: 15,
              fontSize: "1rem",
              fontWeight: 500,
              textAlign: "left",
            }}
            borderColor="#731bde"
            style={{ overflow: "hidden" }}
            size={20}
            label="Remember me"
          />
        </div>
        <Checkbox
          checked={readTerms}
          onChange={(val) => setReadTerms(val)}
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
          labelStyle={{
            marginLeft: 15,
            fontSize: "0.7rem",
            fontWeight: 600,
            textAlign: "left",
          }}
          borderColor="#731bde"
          size={20}
          label={
            <p>
              I have read and agree to the website{" "}
              <Link href="/terms-and-conditions">terms and conditions</Link>
            </p>
          }
        />
        <button onClick={registerUser}>Register</button>
        <p>
          Already have an account?{" "}
          <span>
            <Link href="/login">Login</Link>
          </span>
        </p>
      </main>
    </div>
  ) : null;
}

export default Register;
