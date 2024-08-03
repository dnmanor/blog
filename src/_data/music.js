const EleventyFetch = require("@11ty/eleventy-fetch");
const fetch = require("node-fetch");
require('dotenv').config()

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

async function fetchRecentlyPlayed(accessToken, limit, after) {
  const searchParams = new URLSearchParams({ limit });
  if (after) searchParams.append("after", after);

  const url = `https://api.spotify.com/v1/me/player/recently-played?${searchParams}`;
  
  return EleventyFetch(url, {
    duration: "1d",
    type: "json",
    fetchOptions: {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function uniqueItems(items, key, maxItems = 5) {
  return items.reduce((unique, item) => {
    if (!unique.some(obj => obj[key] === item[key])) {
      unique.push(item);
    }
    return unique.slice(0, maxItems);
  }, []);
}

module.exports = async function () {
  try {
    const accessToken = await getAccessToken();
    const json = await fetchRecentlyPlayed(accessToken, 30, null);

    const recent_music = uniqueItems(json.items, 'track.id');
    const albums = uniqueItems(
      json.items.filter(item => item.track.album.album_type === "album"),
      'track.album.name'
    );

    return { recent_music, albums };
  } catch (error) {
    console.error("Failed getting Spotify recently played tracks:", error);
    return { recent_music: [], albums: [] };
  }
};