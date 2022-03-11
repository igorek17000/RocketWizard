import React, { useState, useEffect } from "react";
import styles from "../styles/Alert.module.scss";

import { RiErrorWarningLine } from "react-icons/ri";

function shadeColor(color, percent) {
  var R = parseInt(color.substring(1, 3), 16);
  var G = parseInt(color.substring(3, 5), 16);
  var B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  var RR = R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  var GG = G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  var BB = B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

export default function Alert({
  text,
  bgColor = "#fff",
  includeIcon = true,
  error = false,
  center = false,
  fontSize = "0.8rem",
}) {
  const [backgroundColor, setBackgroundColor] = useState(bgColor);
  const [borderColor, setBorderColor] = useState(shadeColor(bgColor, -10));
  const [textColor, setTextColor] = useState(shadeColor(bgColor, -50));

  useEffect(() => {
    if (error) {
      setBackgroundColor("#fbe2e1");
      setBorderColor("#e96d69");
      setTextColor("black");
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
