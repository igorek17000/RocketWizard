import React from "react";
import styles from "../styles/DiscordAuthWarning.module.scss";

function DiscordAuthWarning() {
  const getLeftHours = () => {
    const now = new Date();

    const end = new Date("May 09, 2022 16:00:00");

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
      <a
        href="https://discord.com/api/oauth2/authorize?client_id=956209550686556170&redirect_uri=https%3A%2F%2Fwww.rocketwizard.io%2F&response_type=code&scope=identify"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button>Click here</button>
      </a>
    </div>
  );
}

export default DiscordAuthWarning;
