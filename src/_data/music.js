const EleventyFetch = require("@11ty/eleventy-fetch");
const fetch = require("node-fetch");
require("dotenv").config();

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    }).toString(),
  });

  const { access_token } = await response.json();
  return access_token;
}

module.exports = async function () {
  const accessToken = await getAccessToken();
  // const searchParams = new URLSearchParams({
  //   limit: limit,
  // });

  // if (after) {
  //   searchParams.append("after", after);
  // }

  try {
    let json = await EleventyFetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=30`,
      {
        duration: "1d", // 1 day
        type: "json",
        fetchOptions: {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    );

    const result = json.items.reduce((unique, o) => {
      if (!unique.some((obj) => obj.track.id === o.track.id)) {
        unique.push(o);
      }
      return unique.slice(0, 5);
    }, []);

    const albums = json.items.reduce((unique, o) => {
      if (!unique.some((obj) => obj.track.album.name === o.track.album.name)) {
        if (o.track.album.album_type === "album") unique.push(o);
      }
      return unique.slice(0, 5);
    }, []);

    return {
      recent_music: result,
      albums: albums,
    };
  } catch (e) {
    console.log(e)
    console.error("Failed getting GitHub stargazers count, returning 0");
    return {
      recent_music: [],
      albums: [],
    };
  }
};
