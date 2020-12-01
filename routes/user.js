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

//Page access successful
// router.get("/", (req, res) => {
//   console.log(req);
//   console.log(`${clientId}:${clientSecret}`);
//   console.log(authKey);
//   res.render("user");
// });

router.get('/', (req, res) => {
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
            console.log(response.data.tracks.items[0].album.artists[0].name)
            console.log(response.data.tracks.items[0].duration_ms)
            console.log(response.data.tracks.items[0].explicit)
            console.log(response.data.tracks.items[0].preview_url)
            console.log(response.data.tracks.items[0].album.name)
            let tracks = response.data.tracks.items
            res.render('user', { tracks })
        })
        .catch((err) => {
            console.log(err)
        })
    })
})

module.exports = router;
