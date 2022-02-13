import "../styles/globals.css";
import Navbar from "../components/Navbar";

import { Scrollbar } from "react-scrollbars-custom";

function MyApp({ Component, pageProps }) {
  return (
    <Scrollbar style={{ width: "100vw", height: "100vh" }}>
      <Navbar />
      <Component {...pageProps} />
    </Scrollbar>
  );
}

export default MyApp;
