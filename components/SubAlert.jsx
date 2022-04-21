import React, { useState, useEffect } from "react";
import styles from "../styles/SubAlert.module.scss";

import { RiErrorWarningLine } from "react-icons/ri";

export default function SubAlert({
  text,
  includeIcon = true,
  error = false,
  center = false,
  fontSize = "0.8rem",
}) {
  const [backgroundColor, setBackgroundColor] = useState("#43DE6C");
  const [borderColor, setBorderColor] = useState("#43DE6C");
  const [textColor, setTextColor] = useState("white");

  useEffect(() => {
    if (error) {
      setBackgroundColor("#FF4848");
      setBorderColor("#FF4848");
    }
  }, []);

  return (
    <div
      className={styles.alert}
      style={{
        backgroundColor,
        borderColor,
      }}
    >
      {includeIcon && (
        <RiErrorWarningLine color={error ? borderColor : textColor} />
      )}
      <p
        style={{
          color: textColor,
          textAlign: center ? "center" : "left",
          width: center ? "100%" : "fit-content",
          fontSize,
        }}
      >
        {text}
      </p>
    </div>
  );
}
