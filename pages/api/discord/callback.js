import { discordConfig } from "@config/discord";
import Discord from "@lib/discord-api";
import { connectToDatabase } from "@lib/mongodb";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const session = await getSession({ req });

  let email = null;

  if (!session) {
    res.send("not signed");

    return;
  }

  email = session.user.email;

  const discord = new Discord(discordConfig());

  console.log(req.query.code);
  const oauth = await discord.getToken(req.query.code);
  console.log(oauth);
  const user = await discord.getUser(oauth.access_token);
  console.log(user);

  await db
    .collection("users")
    .updateOne({ email }, { $set: { discord_id: user.id } });

  const dbUser = await db.collection("users").findOne({ email });

  if (dbUser.subscriptions && dbUser.subscriptions.length > 0) {
    await discord.joinMember(oauth.access_token, user.id);
  }

  res.redirect("/");

  //res.send(user);
}
