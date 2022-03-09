import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import Link from "next/link";

import { getSession } from "next-auth/react";

import FaqCard from "../components/FaqCard";

import { Typewriter } from "react-simple-typewriter";

import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import OrderSuccess from "../components/OrderSuccess";

export default function Home({ likeData, articleCount }) {
  const { theme } = useTheme();

  const router = useRouter();

  const { orderSuccess } = router.query;

  const [cards] = useState([
    {
      img: "shield.svg",
      title: "Top Tier Risk Mitigation",
      text: "Risk management implemented at its best form with a 96% Trades winning rate",
    },
    {
      img: "roi.svg",
      title: "120% Average ROI",
      text: "Get 120% and above on your initial investment monthly",
    },
    {
      img: "automatic.svg",
      title: "Fully automatic",
      text: "Zero efforts, avoid wasting time, energy and getting stressed with looking at charts all day long",
    },
  ]);

  if (!theme) return null;

  return (
    <div className={styles.container}>
      {orderSuccess && (
        <OrderSuccess
          open={orderSuccess}
          handleClose={() => router.replace("/")}
        />
      )}
      <Head>
        <title>Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* Top Section */}

        <section className={styles.top}>
          <div className={styles.left}>
            <h1>
              Make Money <br />
              While{" "}
              <span style={{ color: "red", fontWeight: "bold" }}>
                {/* Style will be inherited from the parent element */}
                <Typewriter
                  words={[
                    "Sleeping",
                    "Eating",
                    "Gaming",
                    "Training",
                    "Watching TV",
                    "Walking",
                  ]}
                  loop={0}
                  cursor
                  cursorStyle=""
                />
              </span>
            </h1>
            <p>By traders, for everyone</p>
          </div>
          <div className={styles.right}>
            <img
              src={`/images/home/${
                theme === "dark" ? "exchanges_dark.png" : "exchanges_light.png"
              }`}
              alt="Exchanges icon"
            />
            <Link href="/register">
              <button>Start Now</button>
            </Link>
          </div>
        </section>

        {/* Bottom Section */}

        <section className={styles.bottom}>
          <div className={styles.cards}>
            {cards.map((card, i) => (
              <div className={styles.card} key={i}>
                <img src={`/images/home/cards/${card.img}`} alt="Card icon" />
                <div className={styles.text}>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/traders">
            <button>VIEW OUR TRADERS</button>
          </Link>
        </section>
      </main>
      <FaqCard card={false} articleCount={articleCount} likeData={likeData} />
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });

  const articlesRes = await fetch("http://localhost:3000/faqData.json");

  const articleData = await articlesRes.json();

  let articleCount = articleData
    .map((article) => article.rows.length)
    .reduce((a, b) => a + b);

  if (session) {
    const likeRes = await fetch(
      `http://localhost:3000/api/faq-likes?email=${session.user.email}`
    );

    const likeData = await likeRes.json();

    return { props: { likeData, articleCount } };
  } else {
    const likeRes = await fetch(`http://localhost:3000/api/faq-likes`);

    const likeData = await likeRes.json();

    return {
      props: {
        likeData,
        articleCount,
      },
    };
  }
}
