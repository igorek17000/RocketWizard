import React, { useState } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/OrderSuccess.module.scss";

function OrderSuccess({ open, handleClose }) {
  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={handleClose}
    >
      <div className={styles.box}>
        <img src="/images/home/gift.svg" alt="Gift" />
        <div className={styles.cutout} />
        <div className={styles.content}>
          <h3>Congratulations</h3>
          <h5>Your order is confirmed</h5>
          <img src="/images/contact/success.svg" alt="State icon" />
          <button onClick={handleClose}>CONTINUE</button>
        </div>
      </div>
    </Modal>
  );
}

export default OrderSuccess;
