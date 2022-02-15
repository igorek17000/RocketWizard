import Link from "next/link";
import React, { useState, useRef } from "react";
import styles from "../styles/Navbar.module.scss";

import { useRouter } from "next/router";

import { motion } from "framer-motion";

import { useSession, signIn, signOut } from "next-auth/react";

import { FiLogOut } from "react-icons/fi";

import { useDetectClickOutside } from "react-detect-click-outside";

export function MobileMenu({ links, close }) {
  const { data: session, status } = useSession();

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
      {session ? (
        <div className={styles.user}>
          <div className={styles.details}>
            <h3>{session.user.name}</h3>
            <img
              src={
                session.user.image
                  ? session.user.image
                  : "/images/navbar/nopfp.svg"
              }
              alt="Profile icon"
            />
          </div>
          <motion.div
            className={styles.logout}
            onClick={() => signOut("google")}
          >
            <FiLogOut />
            <p>Logout</p>
          </motion.div>
        </div>
      ) : (
        <div className={styles.buttons}>
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
      )}
    </div>
  );
}

function Navbar() {
  const { data: session, status } = useSession();

  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ref = useDetectClickOutside({
    onTriggered: () => {
      if (dropdownOpen) setDropdownOpen(false);
      return;
    },
  });

  const [blacklist] = useState(["/login", "/register"]);

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
      name: "Dashboard",
      link: "/dashboard",
    },
    {
      name: "Contact Us",
      link: "/contact",
    },
  ]);

  const mobileMenuVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "100%" },
  };

  const dropdownVariants = {
    open: { opacity: 1, display: "flex" },
    closed: { opacity: 0, display: "none" },
  };

  if (blacklist.includes(router.pathname)) return null;

  return (
    <nav className={styles.nav}>
      <section className={styles.left}>
        <Link href="/">
          <img src="/images/logo.svg" alt="Logo" />
        </Link>

        <ul className={styles.links}>
          {links.map((link, i) => {
            let isActive = router.pathname.includes(link.link);

            if (link.link === "/") {
              isActive = router.pathname === link.link;
            }

            return (
              <li key={i}>
                <Link href={link.link}>
                  <a className={`${isActive ? styles.activeLink : undefined}`}>
                    {link.name}
                  </a>
                </Link>
              </li>
            );
          })}
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
        {session ? (
          <div className={styles.user} ref={ref}>
            <h3>{session.user.name}</h3>
            <motion.img
              src={
                session.user.image
                  ? session.user.image
                  : "/images/navbar/nopfp.svg"
              }
              alt="Profile icon"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDropdownOpen(true)}
            />
            <motion.div
              className={styles.dropdown}
              animate={dropdownOpen ? "open" : "closed"}
              transition={{ duration: 0.3, type: "tween" }}
              variants={dropdownVariants}
              onClick={() => signOut("google")}
            >
              <FiLogOut />
              <p>Logout</p>
            </motion.div>
          </div>
        ) : (
          <div className={styles.buttons}>
            <Link href="/login">
              <button className={styles.loginBtn}>LOGIN</button>
            </Link>
            <Link href="/register">
              <button className={styles.registerBtn}>REGISTER</button>
            </Link>
          </div>
        )}
      </section>
    </nav>
  );
}

export default Navbar;
