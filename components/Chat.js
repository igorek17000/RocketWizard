import React, { useEffect } from "react";

import { useSession } from "next-auth/react";

const withSession = (Component) => (props) => {
  const session = useSession();

  // if the component has a render property, we are good
  if (Component.prototype.render) {
    return <Component session={session} {...props} />;
  }

  // if the passed component is a function component, there is no need for this wrapper
  throw new Error(
    [
      "You passed a function component, `withSession` is not needed.",
      "You can `useSession` directly in your component.",
    ].join("\n")
  );
};

export default function Chat() {
  const { data: session } = useSession();

  useEffect(() => {
    var Tawk_API = Tawk_API || {};

    if (session) {
      Tawk_API.visitor = {
        name: session.user.name,
        email: session.user.email,
      };
    }

    var Tawk_LoadStart = new Date();

    (function () {
      var s1 = document.createElement("script"),
        s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = "https://embed.tawk.to/621bf831a34c245641289a3c/1fsuk30gn";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      s0.parentNode.insertBefore(s1, s0);
    })();
  }, []);

  return null;
}
