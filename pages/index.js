import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.scss";
import Link from "next/link";

import { useSession } from "next-auth/react";

import FaqCard from "../components/FaqCard";

import { Typewriter } from "react-simple-typewriter";

import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import OrderSuccess from "../components/OrderSuccess";

export default function Home({ articleCount }) {
  const { theme } = useTheme();

  const router = useRouter();

  const { orderSuccess } = router.query;

  const [likeData, setLikeData] = useState(null);

  const { data: session, status } = useSession();

  const getLikeData = async () => {
    const likeRes = await fetch(`http://localhost:3000/api/faq-likes`);

    await fetch(`http://localhost:3000/api/discord/cron`);

    const aeRes = await fetch(`http://localhost:3000/api/get-sub-ends`);

    const likeDataJson = await likeRes.json();
    const aeJson = await aeRes.json();

    setLikeData(likeDataJson);
    console.log(aeJson);
  };

  const test = async () => {
    const ae = await fetch(`http://localhost:3000/api/discord/cron`);

    const aeJson = await ae.json();

    console.log(aeJson);
  };

  const discord = async (code) => {
    const response = await fetch("/api/discord", {
      method: "POST",
      body: JSON.stringify({
        code: code,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (response.status === 200) {
      router.push(json.invite);
    }
  };

  useEffect(() => {
    getLikeData();
  }, []);

  useEffect(() => {
    const discordCode = router.query.code;
    if (discordCode) {
      discord(discordCode);
    }
  }, [router]);

  const [cards] = useState([
    {
      img: "roi.svg",
      title: "56% Compounded Monthly Return",
      text: "Get up to 56% Your initial investment in 1 month.",
    },
    {
      img: "shield.svg",
      title: "Top Tier Risk Mitigation",
      text: "Every selected trader follows a strict risk management policy imposed by Rocketwizard to limit any potential losses and to preserve the longevity of the investments made.",
    },
    {
      img: "automatic.svg",
      title: "Fully automated",
      text: "Avoid wasting time, energy and getting stressed from looking at charts all day long, Let our group of professional and carefully selected traders do the job for you through our API copytrading system. There is no need for any login, personal account access or monitoring of trades from you.",
    },
    {
      img: "quality.svg",
      title: "Quality Control",
      text: "We only accept experienced and reputable traders with a proven track record (acceptance rate of 5%). We also have a dedicated in-house team that ensures all the risk management guidelines are followed closely on a daily basis.",
    },
    {
      img: "community.svg",
      title: "Community of like-minded individuals",
      text: "Join our customers-only community and meet like-minded individuals. You can expect to build strong connections and network with individuals from all over the world and from all kinds of backgrounds. You can also communicate with our traders and learn from their trading experiences and analysis.",
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
            <button onClick={test}>test button</button>
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
            <Link href={session ? "/dashboard" : "/register"}>
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
      {likeData && (
        <FaqCard card={false} articleCount={articleCount} likeData={likeData} />
      )}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const articlesRes = await fetch("http://localhost:3000/faqData.json");

  const articleData = await articlesRes.json();

  let articleCount = articleData
    .map((article) => article.rows.length)
    .reduce((a, b) => a + b);

  return {
    props: {
      articleCount,
    },
  };
}
