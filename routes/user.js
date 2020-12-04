const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../models");
const querystring = require("querystring");
const axios = require("axios");
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authKey = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
const methodOverride = require('method-override');
router.use(methodOverride("_method"));

// USER HOMEPAGE
router.get('/', (req, res) => {
    res.render('user', { tracks: [] })
})

// GET PROFILE PAGE
router.get('/profile', (req, res) => {
  db.user.findOne({
      where: {
          id: req.session.passport.user
      }
  })
  .then((user) => {
      res.render('profile', { user })
  })
})

// GET USER PROFILE
router.get('/profile/:id', (req, res) => {
  db.user.findOne({
    where: {
      id: req.sesssion.passport.user
    }
  })
  .then((id) => {
    console.log(id)
    res.render('profileupdate', { id })
  })
})

// UPDATE USER'S NAME (PUT)
router.put('/profile/:id', (req, res) => {
  console.log(req)
  var updateName = req.body.id;
  db.user.findOne({
    where: {
      id: req.body.id,
    }
  }).then((user) => {
    user.name = updateName;
    user.save();
  }).then((_udpated) => {
    res.send('Name updated successfully');
  }).catch((err) => {
    console.log('An error occured',err);
    res.send('Uh oh');
  })
});



// USER FAVORITES PAGE
router.get('/favorites', (req, res) => {
 
// Get the users
// Pass users to next call

// .then IF user.isAdmin - THEN all tracks
// cont. ELSE !user.isAdmin - THEN only that user's tracks
.then((user) => {
if(user.isAdmin) {
  db.fave.findAll()
} else {
    db.fave.findAll({
        where: {
            userId: req.session.passport.user
        }
    })
  }
})
    .then((tracks) => {
        // console.log(tracks)
        const spotifyIds = tracks.map(track => {
            return track.spotify_id
        })
        return db.track.findAll({
            where: {
                spotify_id: spotifyIds
            }
        })
    })
    .then((faves) => {
        res.render('favorites', { faves, tracks: [] })
    })
})

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
          `https://api.spotify.com/v1/search?q=${track}&type=track,track&offset=0&limit=10`,
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
router.post('/', (req, res) => {
  db.track.findOrCreate({
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

// DELETE A FAVORITE
router.delete('/:id', async (req, res) => {
    console.log(`delete ${req.params}`);
    let deleteTrackId = req.params.id;
    let deleteTrack = await db.fave.destroy ({ 
        where: {
            spotify_id: deleteTrackId,
            userId: req.session.passport.user,
          }
    })
    .catch((err) => {
        console.log(err)
    })
    if (!deleteTrack) {
        res.render("Did not Delete")
    } else {
        res.redirect('/favorites')
    }
})




module.exports = router;


