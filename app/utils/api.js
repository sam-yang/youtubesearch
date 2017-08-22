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

  fetchComments: function(id, token, source) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    if (token) {
      var URL = window.encodeURI('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&maxResults=100&pageToken=' + token + '&videoId='+ id + '&key=' + apikey);
    }
    else {
      var URL = window.encodeURI('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&maxResults=100&videoId='+ id + '&key=' + apikey);
    }
    return axios.get(URL, {cancelToken: source.token})
      .then(function(response) {
        return response.data;
      });
  },

  fetchVideoDetails: function(id, source) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    var URL = window.encodeURI('https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=' + id + '&key=' + apikey);

    return axios.get(URL, {cancelToken: source.token})
      .then(function(response) {
        return response.data;
      });
  },

  fetchTotalComments: function(id) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    var URL = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + id + '&key=' + apikey;

    return axios.get(URL)
      .then(function(response) {
        return response.data.items.statistics.commentCount;
      });
  },

  fetchAllReplies: function(parentId, source) {
    var apikey = 'AIzaSyArWKHJFGMM_zH-wpW8Obrwppc8mVPeIEM';
    var URL = 'https://www.googleapis.com/youtube/v3/comments?part=snippet&maxResults=100&parentId=' + parentId + '&key=' + apikey;

    return axios.get(URL, {cancelToken: source.token})
      .then(function(response) {
        return response.data.items;
      });
  }
}