import React from "react";
import Link from "next/link";
import styles from "../../styles/GuestMessage.module.scss";

function GuestMessage() {
  return (
    <main className={styles.guestMessage}>
      <section className={styles.card}>
        <h1>Hello there!</h1>
        <p>
          <Link href="/register">Create your account</Link> or{" "}
          <Link href="/login">log in</Link> to your existing account to get
          access to a detailed dashboard containing all necessary information
          about your trading history, profit and ROI.
        </p>
        <Link href="/login">
          <button>Create Your Account</button>
        </Link>
      </section>
    </main>
  );
}

export default GuestMessage;
