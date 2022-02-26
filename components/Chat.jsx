import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Chat.module.scss";

import { useSession, getSession } from "next-auth/react";

import { AiOutlineSend } from "react-icons/ai";
import { FaRegWindowMinimize } from "react-icons/fa";

import { Scrollbar } from "react-scrollbars-custom";

import { motion } from "framer-motion";

function Chat({ open, close }) {
  const { data: session, status } = useSession();

  const [pfpSrc, setPfpSrc] = useState(
    session && session.user.image
      ? session.user.image
      : "/images/navbar/nopfp.svg"
  );

  useEffect(() => {
    if (session) {
      setPfpSrc(
        session.user.image ? session.user.image : "/images/navbar/nopfp.svg"
      );
    }
  }, [session]);

  const [messages, setMessages] = useState([
    { msg: "Hello there! Do you need any help?", client: false },
  ]);

  const [message, setMessage] = useState(null);

  const inputRef = useRef(null);

  const send = () => {
    if (!message) return;

    const userMessage = {
      msg: message,
      client: true,
    };

    setMessages([...messages, userMessage]);

    inputRef.current.value = null;
    setMessage(null);
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      send();
    }
  };

  const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "120%" },
  };

  return (
    <motion.section
      className={styles.chat}
      animate={open ? "open" : "closed"}
      variants={variants}
    >
      <section className={styles.header}>
        <h3>Hello!</h3>
        <FaRegWindowMinimize onClick={close} />
      </section>
      <section className={styles.messages}>
        <Scrollbar style={{ width: "100%", height: "20rem" }}>
          {messages.map((message, i) => (
            <div
              className={`${styles.message} ${
                message.client ? styles.clientSender : styles.serverSender
              }`}
              key={i}
            >
              <p>{message.msg}</p>
              <img
                src={message.client ? pfpSrc : "/images/logo_circle.png"}
                alt="User pfp"
              />
            </div>
          ))}
        </Scrollbar>
      </section>
      <section className={styles.sender}>
        <input onChange={(e) => setMessage(e.target.value)} ref={inputRef} />
        <AiOutlineSend onClick={send} onKeyPress={handleKeyPress} />
      </section>
    </motion.section>
  );
}

export default Chat;
