import "../styles/globals.css";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { SessionProvider } from "next-auth/react";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Oval } from "react-loader-spinner";

import { ThemeProvider } from "next-themes";

import { Scrollbar } from "react-scrollbars-custom";

import dynamic from "next/dynamic";

import Router from "next/router";

const ChatWithNoSSR = dynamic(() => import("../components/Chat"), {
  ssr: false,
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    const start = () => {
      setLoading(true);
    };
    const end = () => {
      setLoading(false);
    };
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

  return (
    <ThemeProvider enableSystem={false}>
      <SessionProvider session={session}>
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100vh",
            }}
          >
            <Oval
              color="#731bde"
              secondaryColor="#a879e0"
              height={80}
              width={80}
            />
          </div>
        ) : (
          <Scrollbar style={{ width: "100vw", height: "100vh" }}>
            <ChatWithNoSSR />
            <Navbar />
            <Component {...pageProps} />
          </Scrollbar>
        )}
      </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
