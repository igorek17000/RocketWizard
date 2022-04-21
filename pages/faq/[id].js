import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/FaqArticle.module.scss";

import Faq from "react-faq-component";

import { useRouter } from "next/router";

const faqStyles = {
  bgColor: "transparent",
  titleTextColor: "black",
  rowTitleColor: "black",
  rowContentColor: "grey",
  rowContentPaddingTop: "5px",
};

function FaqArticle({ dataArray }) {
  const router = useRouter();

  const [data, setData] = useState(dataArray[0]);

  useEffect(() => {
    const id = router.query.id;

    if (id && dataArray) {
      setData(dataArray.find((x) => x.id === id) || dataArray[0]);
    }
  }, [router]);

  if (!data) return null;

  return (
    <main className={styles.faqArticle}>
      <Head>
        <title>FAQ | Rocket Wizard</title>
        <meta name="description" content="Make money while sleeping" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className={styles.card}>
        <div className={styles.returnMsg}>
          <p>
            You want to return?{" "}
            <span onClick={() => router.back()}>Click here to go back</span>
          </p>
        </div>
        <Faq data={data} styles={faqStyles} />
      </section>
    </main>
  );
}

export async function getServerSideProps({ req }) {
  const res = await fetch(`http://localhost:3000/faqData.json`);

  const dataArray = await res.json();

  return { props: { dataArray } };
}

export default FaqArticle;
