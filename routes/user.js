const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require('../models');
const querystring = require('querystring');
// const passport = require('../config/ppConfig');
const axios = require('axios');

clientId = process.env.CLIENT_ID;
clientSecret = process.env.CLIENT_SECRET;

const authKey = Buffer.from(clientId + ':' + clientSecret).toString('base64');
//Page access successful
router.get('/user', (req, res) => {
    console.log(req);
    console.log(`${clientId}:${clientSecret}`);
    console.log(authKey);
    res.render('user/user')
})

router.get('/user', (req, res) => {
    axios.post('https://accounts.spotify.com/api/token',
        querystring.stringify({
            grant_type: 'client_credentials'
        }),
        {
            headers: {
                Authorization: 'Basic '
            }
        })
        .then((response) => {
            token = response.data.access_token;
            const config = 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            console.log(token)
        })
        .catch((err) => {
            console.log(err)
        })
})
module.exports = router;