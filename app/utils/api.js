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
      var URL = window.encodeURI('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=20&pageToken=' + token + '&videoId='+ id + '&key=' + apikey);
    }
    else {
      var URL = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=20&videoId='+ id + '&key=' + apikey;
    }
    return axios.get(URL)
      .then(function(response) {
        return response.data;
      });
  }

}