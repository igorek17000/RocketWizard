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

    /*memberCount++;

    let foundUser = await users.find(
      (tempUser) => tempUser.discord_id === user.id
    );

    if (foundUser) {
      authCount++;
    } else {
      nonauthCount++;
    }*/

    if (
      users.find(
        (tempUser) =>
          tempUser.discord_id == user.id &&
          !(tempUser.subscriptions && tempUser.subscriptions.length > 0)
      )
    ) {
      if (!bypassRoles.some((role) => roles.includes(role))) {
        console.log(user);
        //await discord.kickMember(user.id);
      }
    }
  }

  //console.log(memberCount);
  //console.log(authCount);
  //console.log(nonauthCount);

  res.send("done");
}
