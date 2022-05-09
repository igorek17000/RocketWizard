import { discordConfig } from "../../../config/discord";
import Discord from "../../../lib/discord-api";

import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();

  const { bypassRoles } = discordConfig();

  const discord = new Discord(discordConfig());

  const members = await discord.getGuildMembers();

  const users = await db.collection("users").find({}).toArray();

  const demoJson = [
    {
      discord_id: "",
      expire: true,
    },
  ];

  let unverified = 0;
  let verified = 0;
  let memberCount = 0;

  for (const member of members) {
    const user = member.user;
    const roles = member.roles;
    memberCount++;

    if (users.find((userTemp) => userTemp.discord_id === user.id)) {
      verified++;
    } else {
      unverified++;
    }

    /*

    if (demoJson.find((json) => json.discord_id == user.id && json.expire)) {
      if (!bypassRoles.some((role) => roles.includes(role))) {
        await discord.kickMember(user.id);
      }
    }

	*/
  }

  console.log(memberCount);
  console.log(verified);
  console.log(unverified);

  res.send("done");
}
