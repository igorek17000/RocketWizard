import React, { useState } from "react";
import Link from "next/link";
import styles from "../styles/FaqCard.module.scss";

import { useSession } from "next-auth/react";

import { BiStar, BiLink } from "react-icons/bi";
import { BsFillChatRightFill } from "react-icons/bs";
import {
  AiOutlineQuestionCircle,
  AiOutlineMail,
  AiOutlineLike,
  AiOutlineDislike,
  AiFillLike,
  AiFillDislike,
} from "react-icons/ai";

function Article({ article }) {
  return (
    <div className={styles.article}>
      <img src={`/images/faq/articles/${article.img}`} alt="Article" />
      <p>{article.title}</p>
    </div>
  );
}

function CantFind() {
  return (
    <div className={styles.cantFind}>
      <div className={styles.top}>
        <AiOutlineQuestionCircle />
        <h3>{"Can't find an answer?"}</h3>
      </div>
      <div className={styles.body}>
        <div className={styles.block}>
          <AiOutlineMail />
          <h4>Email us</h4>
        </div>
        <div className={styles.block}>
          <BsFillChatRightFill />
          <h4>Chat</h4>
        </div>
      </div>
    </div>
  );
}

function FaqCard({ card = true, likeData }) {
  const [liked, setLiked] = useState(likeData.userLiked || false);
  const [disliked, setDisliked] = useState(likeData.userDisliked || false);

  const [likes, setLikes] = useState(likeData.likes || 0);
  const [dislikes, setDislikes] = useState(likeData.dislikes || 0);

  const { data: session } = useSession();

  const [articles] = useState([
    {
      img: "general.svg",
      title: "General",
    },
    {
      img: "order.svg",
      title: "Order issues",
    },
    {
      img: "products.svg",
      title: "Products & Services",
    },
    {
      img: "payment.svg",
      title: "Payments",
    },
    {
      img: "tech.svg",
      title: "Technical issues",
    },
  ]);

  const [questions] = useState([
    {
      question: "Example question 1",
    },
    {
      question: "Example question 2",
    },
    {
      question: "Example question 3",
    },
  ]);

  const like = async (likedProp) => {
    const bodyLikeData = {
      likes: likedProp ? 1 : -1,
      dislikes: disliked ? -1 : 0,
    };

    if (session) {
      const response = await fetch("/api/faq-likes", {
        method: "POST",
        body: JSON.stringify({
          email: session.user.email,
          likeData: bodyLikeData,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    setLikes((likes) => likes + (likedProp ? 1 : -1));

    if (disliked) {
      setDislikes((dislikes) => dislikes - 1);
    }
    setDisliked(false);
    setLiked(likedProp);
  };

  const dislike = async (dislikedProp) => {
    const bodyLikeData = {
      dislikes: dislikedProp ? 1 : -1,
      likes: liked ? -1 : 0,
    };

    if (session) {
      const response = await fetch("/api/faq-likes", {
        method: "POST",
        body: JSON.stringify({
          email: session.user.email,
          likeData: bodyLikeData,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    setDislikes((dislikes) => dislikes + (dislikedProp ? 1 : -1));

    if (liked) {
      setLikes((likes) => likes - 1);
    }

    setLiked(false);
    setDisliked(dislikedProp);
  };

  return (
    <section
      className={`${styles.faqComponent} ${card ? styles.faqCard : null}`}
    >
      <h1>Frequently Asked Questions</h1>
      <div className={styles.articles}>
        <p>
          There are <span>89 articles</span> in our platform.
        </p>
        <div className={styles.articleGrid}>
          {articles.map((article, i) => (
            <Article article={article} key={i} />
          ))}
          <CantFind />
        </div>
      </div>
      <div className={styles.qAndLinks}>
        <div className={styles.popularQuestions}>
          <div className={styles.title}>
            <BiStar />
            <h3>Popular questions</h3>
          </div>

          <ul>
            {questions.map((question, i) => (
              <li key={i}>{question.question}</li>
            ))}
          </ul>
        </div>
        <div className={styles.links}>
          <div className={styles.title}>
            <BiLink />
            <h3>Useful links for you</h3>
          </div>
          <ul>
            <li>
              <Link href="/contact">Contact form</Link>
            </li>
            <li>
              <Link href="/reviews">Reviews</Link>
            </li>
            <li>
              <Link href="/orders">Your orders</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.find}>
        <h3>Did you find what you were looking for?</h3>
        <div className={styles.likes}>
          <div className={styles.like}>
            <p>{likes}</p>
            {liked ? (
              <AiFillLike onClick={() => like(false)} />
            ) : (
              <AiOutlineLike onClick={() => like(true)} />
            )}
          </div>
          <div className={styles.dislike}>
            <p>{dislikes}</p>
            {disliked ? (
              <AiFillDislike onClick={() => dislike(false)} />
            ) : (
              <AiOutlineDislike onClick={() => dislike(true)} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqCard;
