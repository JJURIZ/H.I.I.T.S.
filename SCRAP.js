let cache = {};
for (const track of faves) {
  cache[track.spotify_id] = cache[track.spotify_id]+1 || 1;
}
const uniqueTracks = [...new Set(faves)]
for (const track of uniqueTracks) {
  track.count = cache[track.spotify_id]
}





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
  console.log(uniqueTracks);
  res.render("favorites", { uniqueTracks });
});





// DELETE A FAVORITE - ORIGINAL CODE
router.delete("/:id", async (req, res) => {
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
    res.redirect("/favorites");
  }
});