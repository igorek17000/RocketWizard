import React, { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../../styles/Faq.module.scss";

import FaqCard from "../../components/FaqCard";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

function Faq({ articleCount }) {
  const [likeData, setLikeData] = useState(null);

  const { data: session, status } = useSession();

  const getLikeData = async () => {
    const likeRes = await fetch(`https://www.rocketwizard.io/api/faq-likes`);

    const likeDataJson = await likeRes.json();

    setLikeData(likeDataJson);
  };

  useEffect(() => {
    getLikeData();
  }, []);

  return (
    <main className={styles.faq}>
      <Head>
        <title>FAQ | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <motion.div
        className={styles.motionDiv}
        transition={{ duration: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {likeData && (
          <FaqCard likeData={likeData} articleCount={articleCount} />
        )}
      </motion.div>
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
