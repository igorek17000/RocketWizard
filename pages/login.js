import Link from "next/link";
import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Login.module.scss";
import { useSession, signIn, signOut } from "next-auth/react";

import { useRouter } from "next/router";

import Checkbox from "react-custom-checkbox";

import Alert from "../components/Alert";

import { useTheme } from "next-themes";

function Login() {
  const router = useRouter();

  const [rememberMe, setRememberMe] = useState(false);

  const [email, setEmail] = useState(null);
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

  const loginUser = async () => {
    if (checkCredentials()) {
      if (!session) {
        try {
          const result = await signIn("credentials", {
            redirect: false,
            name: email.substring(0, email.indexOf("@")),
            email: email,
            password: password,
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

  if (!theme) return null;

  return (
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
        <button className={styles.googleBtn} onClick={() => signIn("google")}>
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
        <button onClick={loginUser}>Login</button>
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
