import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { SessionProvider } from "next-auth/react";

import { Scrollbar } from "react-scrollbars-custom";

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Scrollbar style={{ width: "100vw", height: "100vh" }}>
        <Navbar />
        <Component {...pageProps} />
      </Scrollbar>
    </SessionProvider>
  );
}

export default MyApp;
