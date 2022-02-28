import React, { useState } from "react";
import Head from "next/head";
import styles from "../../styles/Faq.module.scss";

import FaqCard from "../../components/FaqCard";

import { getSession } from "next-auth/react";

function Faq({ likeData, articleCount }) {
  return (
    <main className={styles.faq}>
      <Head>
        <title>FAQ | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FaqCard likeData={likeData} articleCount={articleCount} />
    </main>
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

export default Faq;
