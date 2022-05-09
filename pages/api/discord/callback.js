import { discordConfig } from '@config/discord';
import Discord from '@lib/discord-api';

export default async function handler(req, res) {

    const discord = new Discord(discordConfig());

    console.log(req.query.code);
	const oauth = await discord.getToken(req.query.code);
	console.log(oauth);
	const user = await discord.getUser(oauth.access_token);
	console.log(user);
    
	// add discord_id "user.id" in database

	await discord.joinMember(oauth.access_token, user.id);
	
	res.send(user);
}