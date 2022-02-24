import React from "react";
import Head from "next/head";
import styles from "../styles/Faq.module.scss";

import FaqCard from "../components/FaqCard";

import { getSession } from "next-auth/react";

function Faq({ likeData }) {
  return (
    <main className={styles.faq}>
      <Head>
        <title>FAQ | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <FaqCard likeData={likeData} />
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const session = await getSession({ req });
  if (session) {
    const res = await fetch(
      `https://rocket-wizard.vercel.app/api/faq-likes?email=${session.user.email}`
    );

    const likeData = await res.json();

    return { props: { likeData } };
  } else {
    return {
      props: {
        likeData: {
          likes: 0,
          dislikes: 0,
          userLiked: false,
          userDisliked: false,
        },
      },
    };
  }
}

export default Faq;
