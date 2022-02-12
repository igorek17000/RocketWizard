import Link from "next/link";
import React, { useState } from "react";
import styles from "../styles/Navbar.module.scss";

import { useRouter } from "next/router";

import { motion } from "framer-motion";

export function MobileMenu({ links, close }) {
  return (
    <div className={styles.mobileMenu}>
      <img
        className={styles.close}
        src="/images/navbar/close.svg"
        alt="Icon for closing"
        onClick={() => close(true)}
      />
      <ul>
        {links.map((link, i) => (
          <li key={i}>
            <Link href={link.link}>
              <a onClick={() => close(true)}>{link.name}</a>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/login">
        <button className={styles.loginBtn} onClick={() => close(true)}>
          LOGIN
        </button>
      </Link>
      <Link href="/register">
        <button className={styles.registerBtn} onClick={() => close(true)}>
          REGISTER
        </button>
      </Link>
    </div>
  );
}

function Navbar() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [links] = useState([
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Traders",
      link: "/traders",
    },
    {
      name: "Settings",
      link: "/settings",
    },
    {
      name: "Support",
      link: "/support",
    },
  ]);

  const mobileMenuVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "100%" },
  };

  return (
    <nav className={styles.nav}>
      <section className={styles.left}>
        <Link href="/">
          <img src="/images/logo.svg" alt="Logo" />
        </Link>

        <ul className={styles.links}>
          {links.map((link, i) => (
            <li key={i}>
              <Link href={link.link}>
                <a
                  className={`${
                    router.pathname === link.link
                      ? styles.activeLink
                      : undefined
                  }`}
                >
                  {link.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.right}>
        <img
          className={styles.menu}
          src="/images/navbar/menu.svg"
          alt="Mobile Menu Icon"
          onClick={() => setMobileMenuOpen(true)}
        />
        <motion.div
          className={styles.mobileMenuContainer}
          animate={mobileMenuOpen ? "open" : "closed"}
          transition={{ duration: 0.3, type: "tween" }}
          variants={mobileMenuVariants}
        >
          <MobileMenu close={() => setMobileMenuOpen(false)} links={links} />
        </motion.div>
        <div className={styles.buttons}>
          <Link href="/login">
            <button className={styles.loginBtn}>LOGIN</button>
          </Link>
          <Link href="/register">
            <button className={styles.registerBtn}>REGISTER</button>
          </Link>
        </div>
      </section>
    </nav>
  );
}

export default Navbar;
