import React, { useState } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/SubmissionSent.module.scss";

function SubmissionSent({ open, handleClose, error = false }) {
  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={handleClose}
    >
      <div className={styles.box}>
        <div className={styles.content}>
          <img
            src={`/images/contact/${error ? "fail" : "success"}.svg`}
            alt="State icon"
          />
          <h3 style={{ color: error ? "#FF0000" : "#731BDE" }}>
            {error ? "Oooops!" : "Well done!"}
          </h3>
          <p style={{ color: error ? "#4D2828" : "#6E4E94" }}>
            {error
              ? "Something went wrong let's try again"
              : "We received your submission and we will answer you soon"}
          </p>
          <Link href={error ? "/contact" : "/"}>
            <button
              style={{ backgroundColor: error ? "#FF0000" : "#731BDE" }}
              onClick={handleClose}
            >
              {" "}
              {error ? "Try again" : "Return home"}
            </button>
          </Link>
        </div>
        <img
          className={styles.waves}
          src={`/images/contact/${error ? "fail" : "success"}_waves.svg`}
          alt="Waves"
        />
      </div>
    </Modal>
  );
}

export default SubmissionSent;
