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
            let tracks = response.data.tracks.items
            res.render('user', { tracks })
        })
        .catch((err) => {
            console.log(err)
        })
    })
})

// ADD TRACK TO FAVORITES
router.post('/', (req, res) => {
    db.track.findOrCreate({
        where: { spotify_id: req.body.id },
        defaults: {
            title: req.body.title,
            artist: req.body.artist,
            durationMs: req.body.durationMs,
            explicit: req.body.explicit,
            preview_url: req.body.preview_url
        }
    })
    .then((fave) => {
        // console.log(`This is what is getting PASSED IN ${fave[0].spotify_id}`)
        // console.log(`This is what is getting PASSED IN for ID ${Object.getOwnPropertyNames(res)}`)
        // console.log(`This is what is getting PASSED IN for LOCALS ${res.locals.currentUser}`)
        // console.log(`This is what is getting PASSED IN for REQ USER ${Object.getOwnPropertyNames(req.user)}`)
        // console.log(`This is what is getting PASSED IN for REQ SESSION ${req.session.passport.user}`)
       db.fave.findOrCreate({
           where: { spotify_id: fave[0].spotify_id },
           defaults: {
               userId: req.session.passport.user
           }
       })
    })
    .catch((err) => {
        console.log(err)
    })
    .then(() => { 
        res.redirect('/user')
    })
});

module.exports = router;
