import { discordConfig } from "@config/discord";
import Discord from "@lib/discord-api";
import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const { bypassRoles } = discordConfig();

  const discord = new Discord(discordConfig());

  const members = await discord.getGuildMembers();

  //console.log(members);

  const demoJson = [
    {
      discord_id: "",
      expire: true,
    },
  ];

  const users = await db.collection("users").find({}).toArray();

  let memberCount = 0;
  let authCount = 0;
  let nonauthCount = 0;

  for (const member of members) {
    const user = member.user;
    const roles = member.roles;

    if (!bypassRoles.some((role) => roles.includes(role))) {
      memberCount++;
    }

    /*memberCount++;

    let foundUser = await users.find(
      (tempUser) => tempUser.discord_id === user.id
    );

    if (foundUser) {
      authCount++;
    } else {
      nonauthCount++;
    }*/

    let tempUser = users.find((test) => test.discord_id == user.id);

    if (!tempUser && !user.bot) {
      if (!bypassRoles.some((role) => roles.includes(role))) {
        nonauthCount++;
        // await discord.kickMember(user.id);
      }
    }

    /*
    if (
      users.find(
        (tempUser) =>
          tempUser.discord_id == user.id &&
      )
    ) {
      if (!bypassRoles.some((role) => roles.includes(role))) {
        nonauthCount++;
        await discord.kickMember(user.id);
      }
    }
    */
  }

  authCount = memberCount - nonauthCount;

  console.log(memberCount);
  console.log(authCount);
  console.log(nonauthCount);

  res.send("done");
}
