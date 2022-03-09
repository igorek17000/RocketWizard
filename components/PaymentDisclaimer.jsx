import React, { useState } from "react";
import Link from "next/link";
import Modal from "@material-ui/core/Modal";
import styles from "../styles/PaymentDisclaimer.module.scss";

import { RiErrorWarningLine } from "react-icons/ri";

function PaymentDisclaimer({ apiName, open, handleClose }) {
  return (
    <Modal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={() => handleClose(null)}
    >
      <div className={styles.box}>
        <RiErrorWarningLine
          color={"#e96d69"}
          size={"10rem"}
          style={{ zIndex: 10 }}
        />
        <div className={styles.content}>
          <h3>DISCLAIMER</h3>
          <h5>You will be moved to another page to process the payment</h5>
          <p>
            The amount specified in the invoice is without fees, which means You
            will need to take care of paying the extra amount. Make sure the
            amount We receive is the same as the one specified in the invoice.
          </p>
          <button onClick={() => handleClose(apiName)}>I UNDERSTAND</button>
        </div>
      </div>
    </Modal>
  );
}

export default PaymentDisclaimer;
