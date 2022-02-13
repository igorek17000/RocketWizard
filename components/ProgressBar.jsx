import React from "react";
import styles from "../styles/ProgressBar.module.scss";

function ProgressBar({ progress, bgColor, fillColor }) {
  return (
    <section
      className={styles.progressBar}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <div
        className={styles.fill}
        style={{
          backgroundColor: fillColor,
          width: `${progress}%`,
        }}
      />
    </section>
  );
}

export default ProgressBar;
