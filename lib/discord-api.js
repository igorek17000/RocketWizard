const fetch = require("node-fetch");

class Discord {
  constructor(options) {
    this.endpoint = "https://discord.com/api";
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.scope = options.scope;
    this.redirectUri = options.redirectUri;
    this.botToken = options.botToken;
    this.guildId = options.guildId;
  }

  authorizeUrl() {
    const body = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code",
      redirect_uri: this.redirectUri,
      scope: this.scope.join(" "),
    }).toString();

    return `https://discord.com/oauth2/authorize?${body}`;
  }

  getToken(code) {
    return new Promise(async (resolve, reject) => {
      const body = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: this.redirectUri,
        scope: this.scope.join(" "),
      }).toString();

      await fetch(`${this.endpoint}/oauth2/token`, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "POST",
        body,
      })
        .then((res) => resolve(res.json()))
        .catch((err) => reject(err));
    });
  }

  getUser(accessToken) {
    return new Promise(async (resolve, reject) => {
      await fetch(`${this.endpoint}/users/@me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => resolve(res.json()))
        .catch((err) => reject(err));
    });
  }

  joinMember(accessToken, id) {
    return new Promise(async (resolve, reject) => {
      await fetch(`${this.endpoint}/guilds/${this.guildId}/members/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bot ${this.botToken}`,
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      })
        .then((res) => {
          if (res.status == 201 || res.status == 200) resolve(res.json());
          resolve(null);
        })
        .catch((err) => reject(err));
    });
  }

  kickMember(id) {
    return new Promise(async (resolve, reject) => {
      await fetch(`${this.endpoint}/guilds/${this.guildId}/members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${this.botToken}`,
        },
      })
        .then((res) => {
          if (res.status == 201 || res.status == 200) resolve(res.json());
          resolve(null);
        })
        .catch((err) => reject(err));
    });
  }

  getGuildMembers() {
    return new Promise(async (resolve, reject) => {
      await fetch(
        `${this.endpoint}/guilds/${this.guildId}/members?limit=1000`,
        {
          headers: { Authorization: `Bot ${this.botToken}` },
        }
      )
        .then(async (res) => {
          if (res.status == 201 || res.status == 200) resolve(res.json());
          resolve([]);
        })
        .catch((err) => reject(err));
    });
  }
}

module.exports = Discord;
