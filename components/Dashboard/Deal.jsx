import React from "react";
import styles from "../../styles/Deal.module.scss";

function LightenDarkenColor(col, amt) {
  var usePound = false;

  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function Deal({ deal }) {
  const gradient = `linear-gradient(90deg, ${LightenDarkenColor(
    deal.bgColor,
    -70
  )} 0%, ${deal.bgColor} 100%)`;

  return (
    <main className={styles.deal} style={{ background: gradient }}>
      <div className={styles.circles}>
        <div className={styles.circle} />
        <div className={styles.circle} />
      </div>
      <section className={styles.top}>
        <h3>{deal.name}</h3>
      </section>
      <img src="/images/dashboard/dashedLine.svg" alt="Dashed line" />
      <section className={styles.bottom}>
        <p>{deal.description}</p>
      </section>
    </main>
  );
}

export default Deal;
