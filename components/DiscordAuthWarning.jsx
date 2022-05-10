import React from "react";
import styles from "../styles/DiscordAuthWarning.module.scss";

function DiscordAuthWarning() {
  const getLeftHours = () => {
    const now = new Date();

    const end = new Date("May 11, 2022 18:00:00");

    const hours = Math.round(Math.abs(end - now) / 36e5);

    return hours;
  };

  return (
    <div className={styles.main}>
      <p>
        Because of some updates to our discord system, you will need to click
        the button and authorize your discord account in the next{" "}
        {getLeftHours()} hours, or you will be kicked out of the server.{" "}
        {"Don't "}
        worry, you can rejoin as long as your subscription is still active.
      </p>
      <a href="/api/discord/auth" target="_blank" rel="noopener noreferrer">
        <button>Click here</button>
      </a>
    </div>
  );
}

export default DiscordAuthWarning;
