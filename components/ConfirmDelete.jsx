import React, { useState } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/SubmissionSent.module.scss";

function ConfirmDelete({ apiName, open, handleClose }) {
  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={() => handleClose(null)}
    >
      <div className={styles.box}>
        <div className={styles.content}>
          <img src={`/images/contact/fail.svg`} alt="State icon" />
          <h3 style={{ color: "#FF0000" }}>
            Are you sure you want to proceed?
          </h3>
          <p style={{ color: "#4D2828" }}>This action is irreversible!</p>
          <button
            style={{ backgroundColor: "#FF0000" }}
            onClick={() => handleClose(apiName)}
          >
            DELETE
          </button>
          <button onClick={() => handleClose(null)} className={styles.cancel}>
            CANCEL
          </button>
        </div>
        <img
          className={styles.waves}
          src={`/images/contact/fail_waves.svg`}
          alt="Waves"
        />
      </div>
    </Modal>
  );
}

export default ConfirmDelete;
