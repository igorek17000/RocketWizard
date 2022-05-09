import {discordConfig} from '@config/discord';
import Discord from '@lib/discord-api';

export default function handler(req, res) {
  const discord = new Discord(discordConfig());

  res.redirect(discord.authorizeUrl());
  //res.status(200).json({ url: discord.authorizeUrl() })
}
