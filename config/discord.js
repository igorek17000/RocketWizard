export const discordConfig = () => {
  return {
    guildId: "",
    clientId: "",
    clientSecret: "",
    scope: ["guilds.join", "identify", "email"],
    redirectUri: "http://localhost:3000/api/discord/callback",
    botToken: "",
    bypassRoles: [],
  };
};
