import { discordConfig } from "@config/discord";
import Discord from "@lib/discord-api";
import { getSession } from "next-auth/react";
export default async function handler(req, res) {
  const session = await getSession({ req });

  if (session) {
    const discord = new Discord(discordConfig());

    res.redirect(discord.authorizeUrl());

    return;
  }

  res.redirect("/");
}
