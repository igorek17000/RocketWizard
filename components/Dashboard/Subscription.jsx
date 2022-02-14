import React, { useState, useEffect } from "react";
import styles from "../../styles/Subscription.module.scss";

function Subscription({ subscription }) {
  const [subNames] = useState(["Basic", "Advanced", "Professional"]);
  const [remainingDays, setRemainingDays] = useState(null);

  useEffect(() => {
    let start = new Date();
    let end = new Date(subscription.end);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingDays(diffDays);
  }, []);

  return (
    <main className={styles.subscription}>
      <section className={styles.left}>
        <div className={styles.info}>
          <h4>{subNames[subscription.id]}</h4>
          <p>
            {remainingDays} day{remainingDays > 1 && "s"} remaining
          </p>
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
