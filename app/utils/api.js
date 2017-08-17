var axios = require('axios');

module.exports = {
  fetchInitialComments: function(id) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    var URL = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=20&videoId='+ id + '&key=' + apikey;

    return axios.get(URL)
      .then(function(response) {
        return response.data;
      });
  },

  fetchComments: function(id, token) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    if (token) {
      var URL = window.encodeURI('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&pageToken=' + token + '&videoId='+ id + '&key=' + apikey);
    }
    else {
      var URL = window.encodeURI('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId='+ id + '&key=' + apikey);
    }
    return axios.get(URL)
      .then(function(response) {
        return response.data;
      });
  },

  fetchVideoDetails: function(id) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    var URL = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + id + '&key=' + apikey;

    return axios.get(URL)
      .then(function(response) {
        return response.data;
      });
  }
}