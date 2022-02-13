import React from "react";
import styles from "../../styles/Subscription.module.scss";

function Subscription({ subscription }) {
  return (
    <main className={styles.subscription}>
      <section className={styles.left}>
        <div className={styles.info}>
          <h4>Professional</h4>
          <p>28 days remaining</p>
        </div>
        <button>Renew subscription</button>
      </section>
      <section className={styles.right}>
        <h3>
          ${subscription.price}
          <span>/month</span>
        </h3>
      </section>
    </main>
  );
}

export default Subscription;
