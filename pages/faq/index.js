import React, { useState } from "react";
import Head from "next/head";
import styles from "../../styles/Faq.module.scss";

import FaqCard from "../../components/FaqCard";
import Chat from "../../components/Chat";

import { getSession } from "next-auth/react";

function Faq({ likeData, articleCount }) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main className={styles.faq}>
      <Head>
        <title>FAQ | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FaqCard
        likeData={likeData}
        articleCount={articleCount}
        openChat={() => setChatOpen(true)}
      />
      <Chat open={chatOpen} close={() => setChatOpen(false)} />
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });

  const articlesRes = await fetch(
    "https://rocket-wizard.vercel.app/faqData.json"
  );

  const articleData = await articlesRes.json();

  let articleCount = articleData
    .map((article) => article.rows.length)
    .reduce((a, b) => a + b);

  if (session) {
    const likeRes = await fetch(
      `https://rocket-wizard.vercel.app/api/faq-likes?email=${session.user.email}`
    );

    const likeData = await likeRes.json();

    return { props: { likeData, articleCount } };
  } else {
    const likeRes = await fetch(
      `https://rocket-wizard.vercel.app/api/faq-likes`
    );

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
