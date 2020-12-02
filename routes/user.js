const express = require("express");
const router = express.Router();
require("dotenv").config();
const db = require("../models");
const querystring = require("querystring");
// const passport = require('../config/ppConfig');
const axios = require("axios");
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authKey = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

// USER HOMEPAGE
router.get('/', (req, res) => {
  res.render('user', { tracks: [] });
});

// FIND SONGS
router.get('/:track', (req, res) => {
    axios.post('https://accounts.spotify.com/api/token',
    querystring.stringify({
        grant_type: 'client_credentials'
    }),
    {
        headers: {
            Authorization: `Basic ${authKey}`
        }
    })
    .then((response) => {
        let token = response.data.access_token;
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        let track = encodeURIComponent(req.query.track)
        axios.get(`https://api.spotify.com/v1/search?q=${track}&type=track,track&offset=0&limit=10`, config)
        .then((response) => {
            // console.log(response.data.tracks.items[0].album.artists[0].name)
            // console.log(response.data.tracks.items[0].duration_ms)
            // console.log(response.data.tracks.items[0].explicit)
            // console.log(response.data.tracks.items[0].preview_url)
            // console.log(response.data.tracks.items[0].album.name)
            console.log(response.data.tracks.items[0])
            let tracks = response.data.tracks.items
            res.render('user', { tracks })
        })
        .catch((err) => {
            console.log(err)
        })
    })
})

router.post('/', (req, res) => {
    db.track.findOrCreate({
        where: { spotify_id: req.body.id },
        defaults: { track: req.body.track }
    })
    .then(([track, created]) => {
        db.
    })
})

module.exports = router;
