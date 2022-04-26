const fetch = require("node-fetch");
const axios = require("axios");
const { URLSearchParams } = require("url");
const botToken = process.env.botToken;

function make_config(authorization_token, isBot = false) {
  // Define the function
  const data = {
    // Define "data"
    headers: {
      // Define "headers" of "data"
      authorization: `${
        isBot == true ? "Bot " : "Bearer "
      }${authorization_token}`, // Define the authorization and add 'Bot ' if the token is of a bot
      "Content-Type": "application/json",
    },
  };
  return data; // Return the created object
}

async function isInsideServer(userID) {
  const response = await axios
    .get(
      "https://discord.com/api/v9/guilds/952251011127464016/members/" + userID, // Server ID
      make_config(botToken, true)
    )
    .catch();

  return response.status === 200;
}

async function make_invite() {
  // 755117951719440384
  // 521410157847117865

  const response = await fetch(
    "https://discord.com/api/v9/channels/952251011127464019/invites", // Channel ID
    {
      method: "POST",
      body: JSON.stringify({ max_uses: 1 }),
      headers: make_config(botToken, true).headers,
    }
  );

  const data = await response.json();

  return "https://discord.gg/" + data["code"];
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { code } = req.body;

    const params = new URLSearchParams();
    params.append("client_id", "956209550686556170");
    params.append("client_secret", "kmDi_2OdSyjyoz1bxJjl2zqkEAyxypCp");
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000/");
    params.append("scope", "identify");

    fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: params,
    })
      .then((response) => response.json())
      .then(async (data) => {
        axios
          .get(
            "https://discord.com/api/users/@me",
            make_config(data.access_token)
          )
          .then(async (response) => {
            let isInServer;

            try {
              isInServer = await isInsideServer(response.data.id);
            } catch {
              isInServer = false;
            }

            if (!isInServer) {
              const invite = await make_invite();

              res.status(200).json({ invite });
            } else {
              res.status(502).json({ msg: "User is already in the server. " });
            }
          })
          .catch((err) => {
            res.status(500);
          });
      });
  }
}
