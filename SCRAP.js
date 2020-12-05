let cache = {};
for (const track of faves) {
  cache[track.spotify_id] = cache[track.spotify_id]+1 || 1;
}
const uniqueTracks = [...new Set(faves)]
for (const track of uniqueTracks) {
  track.count = cache[track.spotify_id]
}

