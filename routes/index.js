const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/user');
const SpotifyWebApi = require('spotify-web-api-node');
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const scope = process.env.SCOPE;

var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');

// credentials are optional
const spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectUri,
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//
//   res.render('index', { title: 'Welcome' });
// });

router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Super TV' });
  res.redirect('/login')
});

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

router.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);


  // your application requests authorization
  // var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state
      }));
});

router.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        spotifyApi.setAccessToken(access_token);

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });


        // we can also pass the token to the browser to make requests from there
        // res.redirect('/#' +
        //     querystring.stringify({
        //       access_token: access_token,
        //       refresh_token: refresh_token
        //     }));
        res.redirect('/dashboard');
      } else {
        res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
      }
    });
  }
});

router.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

router.get('/dashboard', async function(req, res) {
  try {
    const user = await spotifyApi.getMe();
    const favArtists = await spotifyApi.getMyTopArtists();
    const favouriteTracks = await spotifyApi.getMyTopTracks();
    const favouriteArtists = await spotifyApi.getMyTopArtists();
    const genres = await favouriteArtists.body.items[0].genres;
    await console.log(genres);
    function mostFreqGenres() {
      let arr = [];
      for (let i of favouriteArtists.body.items) {
        for (let j of i.genres) {
          arr.push(j)
        }
      }
      let counts = arr.reduce((a, c) => {
        a[c] = (a[c] || 0) + 1;
        return a;
      }, {});
      let maxCount = Math.max(...Object.values(counts));
      return mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);
    }

    // const userid = await user.body.id;
    // const newPlaylist = await spotifyApi.createPlaylist(userid, 'Your Top 20 by Spotifave');
    // const newPlaylistId = await newPlaylist.body.id;
    // const favTracksUris = function() {
    //   let arr = [];
    //     for (let song of favouriteTracks.body.items) {
    //       arr.push(song.uri)
    //     }
    //   return arr;
    // };
    // // await console.log(favTracksUris());
    // await spotifyApi.addTracksToPlaylist(newPlaylistId, favTracksUris());
    // await console.log(newPlaylist);
    // await console.log(favouriteTracks.body);
    // console.log('>>> FAVS');
    // await console.log(favouriteArtists.body.items);
    // const example = await spotifyApi.getArtistAlbums('2cCUtGK9sDU2EoElnk0GNB');
    // await console.log('>>> OUTPUT' ,example.body);
    // await console.log('>>> ME', user.body)
    const renderData = {
      username: await user.body.display_name,
      avatar: await user.body.images[0].url,
      top3artists: [
        {name: await favArtists.body.items[0].name,
         image: await favArtists.body.items[0].images[0].url,
         link: await favArtists.body.items[0].external_urls.spotify},
        {name:await favArtists.body.items[1].name,
         image: await favArtists.body.items[1].images[0].url,
         link: await favArtists.body.items[1].external_urls.spotify},
        {name: await favArtists.body.items[2].name,
        image: await favArtists.body.items[2].images[0].url,
         link: await favArtists.body.items[2].external_urls.spotify},
        ],
      top50Songs: favouriteTracks.body.items,
      topArtists: favouriteArtists.body.items,
      mostFreqGenres: mostFreqGenres(),

      // top3artistsImages: [await favArtists.body.items[0].images.url, await favArtists.body.items[1].images.url, await favArtists.body.items[2].images.url]
    };
    // await console.log(favouriteArtists.body.items[0]);
    // await console.log(renderData.topArtists);
    // await console.log(renderData.top3artists);
    res.render('dashboard', {
      title: 'Dashboard',
      username: renderData.username,
      avatar: renderData.avatar,
      top3artists: renderData.top3artists,
      top50Songs: renderData.top50Songs,
      topArtists: renderData.topArtists,
      mostFreqGenres: mostFreqGenres(),
    })
  } catch(e) {
    console.log(e);
    res.redirect('/login');
    // res.render('dashboard', {title: 'Dashboard', username: 'NULL'})
  }
  // res.render('dashboard', {title: 'Dashboard', username: 'NULL'})
});

router.post('/dashboard', async (req, res) => {
  const user = await spotifyApi.getMe();
  const userid = await user.body.id;
  const favouriteTracks = await spotifyApi.getMyTopTracks({time_range: 'long_term', limit: 50, offset: 0});
  const newPlaylist = await spotifyApi.createPlaylist(userid, 'Your Top 20 by Spotifave');
  const newPlaylistId = await newPlaylist.body.id;
  const favTracksUris = function() {
    let arr = [];
    for (let song of favouriteTracks.body.items) {
      arr.push(song.uri)
    }
    return arr;
  };
  await spotifyApi.addTracksToPlaylist(newPlaylistId, favTracksUris());
  await res.json({status: 'OK'})
});
// router.get('/login', function(req, res, next) {
//   res.render('login', { title: 'Login' });
// });

// router.get('/login', function(req, res) {
//   const scopes = 'user-read-private user-read-email';
//   res.redirect('https://accounts.spotify.com/authorize' +
//       '?response_type=code' +
//       '&client_id=' + process.env.CLIENT_ID +
//       (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
//       '&redirect_uri=' + encodeURIComponent('http://localhost:3000/'));
// });

module.exports = router;
