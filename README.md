# H.I.I.T.S. - High Intensity Interval Training Songs

## Description 
### A webapp for gym users to share their favorite songs with gym owners.
Poor music choices plague many gyms, leading to frustration on the part of trainers and members. 
Though H.I.T.T.S. will not eliminate this frustration completely, it is a step in allievating the universal discomfort. 

### <ins>How It Works</ins>
Users create an account using their email address and name. \
Once logged in members can search the Spotify database for their favorite songs.
Results are returned with the artist, length, explicit lyrics notification, and 30 second preview (if available). Once a gym friendly track is selected, members click the "Add to Favorites" button. \
To see a list of favorite tracks, members click the "Favorites" menu option. \
Users may change their profile name by clicking Profile and entering a new name.

Administrators have the same functionality as members. However, when an admin views Favorites, they will see all tracks added by all gym members. 
By reviewing the gym members favorite songs, playlists can be created on the platform of the administrators choice. \
NOTE: Playlist creation is outside the scope of H.I.T.T.S.

### <ins>How to Install</ins>
IMPORTANT NOTE
H.I.I.T.S. requires a Spotify Developer app. You must have a Spotify account (free) before proceeding.\
-To create your Spotify App, go to the [Developer Dashboard](https://developer.spotify.com/dashboard/applications) and click `Create An App`.\
-Provide and app name and brief description. Accept the terms and conditions and click `Create`. \
-The client ID and client secret are available here. Refer to these codes after installation. \
-Click the `Edit Settings` button. 
-Type in your redirect URI. Typically this will be `http://localhost:3005`. Should you prefer a different port, change the port value to match your local application setting. \
-Click Add. \
-At the bottom of `Edit Settings` click the `Save` button to complete Spotify setup. 


To install H.I.I.T.S., clone the [git repository](https://github.com/JJURIZ/H.I.I.T.S.). \
-Once cloned, use the CLI to navigate to the cloned directory. \
-Run `npm install` to install the necessary dependencies. \
-Create a new file called `.env` in the root directory of the application. This will be used to store sensitive app information. 
-Open the app directory in your preferred editor. \
-Open the `.env` file created previously. 
-Record your CLIENT_ID, CLIENT_SECRET, and create a SECRET_SESSION string. See image below for example: \
![.env_example](public/assets/Secrets.png) \
-Launch the application using the command `node server.js`. \
-In your browser, navigate to `localhost:3005` \

or 

-[Live Demo](https://hiitsongs.herokuapp.com/)


## Database Structure
In order to create a multi-user application a join table was required allowing many to many relationships.
### <ins>Users Table</ins>
The `users` table contains information related to the user. A user's email address is used to log into the application. \
Users with the `isAdmin` flag as true see the results of all user's favorite songs. 
|name   |email   |password   |isAdmin   |
|---|---|---|---|---|
|Joe Smith   |joesmith@email.com   |pa$$word   |f  |


### <ins>Tracks Table</ins>
`tracks` table contains the relevant information about the songs added by the user.

|title   |artist   |explicit   |durationMs   |spotify_id |preview_url 
|---|---|---|---|---|---|
|Song #2  |Blur   |f  |198000  |3GfOAdcoc3X5GPiiXmpBjK |spotify:track:3GfOAdcoc3X5GPiiXmpBjK

### <ins>Faves Table (JOIN)</ins>
As designed, many users may 'favorite' the same song. \
The `faves` table joins the `users` and `tracks` tables. \
`userId` joins to the `users` table `id` field. \
`spotify_id` joins to the `tracks` table column of the same name. \
In the example below, two users are associated with the same track.
|userId  |spotify_id  |
|---|---|
|3  |3GfOAdcoc3X5GPiiXmpBjK   |
|4  |3GfOAdcoc3X5GPiiXmpBjK   |


## Technologies Used
JavaScript, Express, CSS, EJS, Postgres, and Sequelize 

The heart of the application is the `user.js` controller. Outside of user authentication, all other routing is found in this file. \
In particular, the route for displaying a user's favorite songs is of interest.
```js
router.get("/favorites", async (req, res) => {
  let tracks;
  try {
  if (req.user.isAdmin) {
    tracks = await db.fave.findAll();
  } else {
    tracks = await db.fave.findAll({
      where: {
        userId: req.session.passport.user,
      },
    });
  }
  console.log(tracks);
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
  let userId = req.session.passport.user;
  res.render("favorites", { uniqueTracks, tracks: [], userId });
  } catch(err) {
    console.log(`This is the error: ${err}`)
    res.render("404")
  }
});
```

## Lessons Learned
A future blog post will dive deeper into this. Every day was a lesson in patience and avoiding panic. \
There were many challenges with this project, from routing to implementing the user and admin favorites view. \
This is the first API requiring authorization I worked with. I spent many hours reading Spotify's API documentation and watching videos on how to implement it. \
The greatest lesson I learned from this p


