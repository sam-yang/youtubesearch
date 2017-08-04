var axios = require('axios');

module.exports = {
  fetchYoutubeComments: function(id) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    var URL = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=20&videoId='+ id + '&key=' + apikey;

    return axios.get(URL)
      .then(function(response) {
        return response.data.items;
      });
  }
}