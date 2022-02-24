import Link from "next/link";
import React, { useState, useEffect } from "react";
import styles from "../styles/Navbar.module.scss";

import { useRouter } from "next/router";

import { motion } from "framer-motion";

import { useSession, signIn, signOut } from "next-auth/react";

import { FiLogOut } from "react-icons/fi";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

import { useDetectClickOutside } from "react-detect-click-outside";

import ToggleSwitch from "../components/ToggleSwitch";
import "react-toggle/style.css";

import { useTheme } from "next-themes";

export function MobileMenu({ links, close }) {
  const { data: session, status } = useSession();

  return (
    <div className={styles.mobileMenu}>
      <AiOutlineClose className={styles.close} onClick={() => close(true)} />
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
            onClick={() => {
              signOut("google");
              signOut("credentials");
            }}
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
      <ToggleSwitch />
    </div>
  );
}

function Navbar() {
  const { data: session, status } = useSession();

  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [render, setRender] = useState(false);

  const { theme, setTheme } = useTheme();

  const ref = useDetectClickOutside({
    onTriggered: () => {
      setDropdownOpen(false);

      return;
    },
  });

  const [blacklist] = useState([
    "/login",
    "/register",
    "/complete-registration",
    "/account-created",
  ]);

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
      name: "Settings",
      link: "/settings",
    },
    {
      name: "Contact Us",
      link: "/contact",
    },
    {
      name: "FAQ",
      link: "/faq",
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

  const [logoSrc, setLogoSrc] = useState("logo_light.svg");
  const [pfpSrc, setPfpSrc] = useState(
    session && session.user.image
      ? session.user.image
      : "/images/navbar/nopfp.svg"
  );

  useEffect(() => {
    setLogoSrc(theme === "dark" ? "logo_dark.svg" : "logo_light.svg");
  }, [theme]);

  useEffect(() => {
    if (session) {
      setPfpSrc(
        session.user.image ? session.user.image : "/images/navbar/nopfp.svg"
      );
    }
  }, [session]);

  return !blacklist.includes(router.pathname) && theme ? (
    <nav className={styles.nav}>
      <section className={styles.left}>
        <Link href="/">
          <img src={`/images/${logoSrc}`} alt="Logo" />
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
      <section className={styles.right} ref={ref}>
        <div className={styles.toggle}>
          <ToggleSwitch />
        </div>

        <AiOutlineMenu
          className={styles.menu}
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
          <div className={styles.user}>
            <h3>{session.user.name}</h3>
            <motion.img
              src={pfpSrc}
              alt="Profile icon"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            <motion.div
              className={styles.dropdown}
              animate={dropdownOpen ? "open" : "closed"}
              transition={{ duration: 0.3, type: "tween" }}
              variants={dropdownVariants}
            >
              <div className={styles.header}>
                <p>{session.user.name}</p>
                <AiOutlineClose
                  className={styles.closeDropdown}
                  onClick={() => setDropdownOpen(false)}
                />
              </div>
              <div
                className={styles.logoutBtn}
                onClick={() => {
                  signOut("google");
                  signOut("credentials");
                }}
              >
                <FiLogOut />
                <p>Logout</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className={styles.buttons}>
            <Link href="/login">
              <motion.button
                className={styles.loginBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                LOGIN
              </motion.button>
            </Link>
            <Link href="/register">
              <motion.button
                className={styles.registerBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                REGISTER
              </motion.button>
            </Link>
          </div>
        )}
      </section>
    </nav>
  ) : null;
}

export default Navbar;
