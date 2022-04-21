import "../styles/globals.css";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { SessionProvider } from "next-auth/react";

import { BsDiscord } from "react-icons/bs";

import UnderMaintenance from "../components/UnderMaintenance";

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
  const [taken, setTaken] = React.useState(false);

  const checkApiTaken = async () => {
    const takenRes = await fetch(`http://localhost:3000/api/is-any-taken`);

    const takenjson = await takenRes.json();

    if (takenjson.taken) {
      setTaken(true);
    }
  };

  useEffect(() => {
    const start = () => {
      setLoading(true);
      checkApiTaken();
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

  const UNDER_MAINTENANCE = false;

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

            {UNDER_MAINTENANCE ? (
              <UnderMaintenance />
            ) : (
              <>
                <Navbar />
                <Component {...pageProps} />
              </>
            )}

            {/*<h1 className="beta">BETA</h1>*/}
            {taken && (
              <div className="discord">
                <BsDiscord fill="#4e388" />
                <p>
                  <a
                    href="https://discord.com/api/oauth2/authorize?client_id=956209550686556170&redirect_uri=https%3A%2F%2Fwww.rocketwizard.io%2F&response_type=code&scope=identify"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join the Discord
                  </a>
                </p>
              </div>
            )}
          </Scrollbar>
        )}
      </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
