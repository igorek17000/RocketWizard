import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../../styles/Faq.module.scss";

import FaqCard from "../../components/FaqCard";

import { useSession } from "next-auth/react";

function Faq({ articleCount }) {
  const [likeData, setLikeData] = useState(null);

  const { data: session, status } = useSession();

  const getLikeData = async () => {
    if (!session) return;

    const likeRes = await fetch(`https://www.rocketwizard.io/api/faq-likes`);

    const likeDataJson = await likeRes.json();

    setLikeData(likeDataJson);
  };

  useEffect(() => {
    getLikeData();
  }, [session]);

  return (
    <main className={styles.faq}>
      <Head>
        <title>FAQ | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {likeData && <FaqCard likeData={likeData} articleCount={articleCount} />}
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const articlesRes = await fetch("https://www.rocketwizard.io/faqData.json");

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

export default Faq;
