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

    let tempUser = users.find((test) => test.discord_id == user.id);

    if (!bypassRoles.some((role) => roles.includes(role))) {
      memberCount++;

      let isSubbed = true;

      if (tempUser) {
        if (tempUser.subscriptions) {
          if (tempUser.subscriptions.length === 0) {
            isSubbed = false;
          }
        } else {
          isSubbed = false;
        }
      }

      if ((!tempUser || !isSubbed) && !user.bot) {
        nonauthCount++;
        // await discord.kickMember(user.id);
      }
    }
  }

  authCount = memberCount - nonauthCount;

  console.log("members: ", memberCount);
  console.log("staying in: ", authCount);
  console.log("have to be kicked: ", nonauthCount);

  res.send("done");
}
