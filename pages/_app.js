import "../styles/globals.css";
import React from "react";
import Navbar from "../components/Navbar";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "next-themes";

import { Scrollbar } from "react-scrollbars-custom";

function MyApp({ traders, Component, pageProps: { session, ...pageProps } }) {
  return (
    <ThemeProvider enableSystem={false}>
      <SessionProvider session={session}>
        <Scrollbar style={{ width: "100vw", height: "100vh" }}>
          <Navbar />
          <Component {...pageProps} />
        </Scrollbar>
      </SessionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
