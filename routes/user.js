const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../models");
const querystring = require("querystring");
const axios = require("axios");
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authKey = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const methodOverride = require("method-override");
router.use(methodOverride("_method"));

// USER HOMEPAGE
router.get("/", (req, res) => {
  res.render("user", { tracks: [] });
});

// GET PROFILE PAGE
router.get("/profile", (req, res) => {
  db.user
    .findOne({
      where: {
        id: req.session.passport.user,
      },
    })
    .then((user) => {
      res.render("profile", { user });
    });
});

// UPDATE USER'S NAME (PUT REQUEST)
router.put("/profile", (req, res) => {
  db.user.update(
    { name: user.name },
    { where: {
        id: req.session.passport.user
      },
    })
    .then((_udpated) => {
      res.render("profile", { user });
    })
    .catch((err) => {
      console.log("An error occured", err);
      res.send("Uh oh");
    });
});

// USER FAVORITES PAGE
router.get("/favorites", async (req, res) => {
  let tracks;
  if (req.user.isAdmin) {
    tracks = await db.fave.findAll();
  } else {
    tracks = await db.fave.findAll({
      where: {
        userId: req.session.passport.user,
      },
    });
  }
  const spotifyIds = await tracks.map((track) => {
    return track.spotify_id;
  });
  const faves = await db.track.findAll({
    where: {
      spotify_id: spotifyIds,
    },
  });
  let cache = {};
  for (const track of faves) {
    if (cache[track.spotify_id]) {
      cache[track.spotify_id]++;
    } else {
      cache[track.spotify_id] = 1;
    }
  }
  const uniqueTracks = [...new Set(faves)];
  for (const track of uniqueTracks) {
    track.count = cache[track.spotify_id];
  }
  try {
  let userId = req.session.passport.user;
  res.render("favorites", { uniqueTracks, tracks: [], userId });
  } catch(err) {
    console.log(err)
  }
});

// FIND TRACKS
router.get("/:track", (req, res) => {
  axios
    .post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "client_credentials",
      }),
      {
        headers: {
          Authorization: `Basic ${authKey}`,
        },
      }
    )
    .then((response) => {
      let token = response.data.access_token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      let track = encodeURIComponent(req.query.track);
      axios
        .get(
          `https://api.spotify.com/v1/search?q=${track}&type=track,track&offset=0&limit=12`,
          config
        )
        .then((response) => {
          let tracks = response.data.tracks.items;
          res.render("user", { tracks });
        })
        .catch((err) => {
          console.log(err);
        });
    });
});

// ADD TRACK TO FAVORITES
router.post("/", (req, res) => {
  db.track
    .findOrCreate({
      where: { spotify_id: req.body.id },
      defaults: {
        title: req.body.title,
        artist: req.body.artist,
        durationMs: req.body.durationMs,
        explicit: req.body.explicit,
        preview_url: req.body.preview_url,
      },
    })
    .then((fave) => {
      db.fave.findOrCreate({
        where: {
          spotify_id: fave[0].spotify_id,
          userId: req.session.passport.user,
        },
      });
    })
    .catch((err) => {
      console.log(err);
    })
    .then(() => {
      res.redirect("/user");
    });
});

// DELETE A FAVORITE - ORIGINAL CODE
router.delete("/favorites/:id", async (req, res) => {
  let deleteTrackId = req.params.id;
  let deleteTrack = await db.fave
    .destroy({
      where: {
        spotify_id: deleteTrackId,
        userId: req.session.passport.user,
      },
    })
    .catch((err) => {
      console.log(err);
    });
  if (!deleteTrack) {
    res.render("Did not Delete");
  } else {
    res.redirect("/user/favorites");
  }
});

module.exports = router;
