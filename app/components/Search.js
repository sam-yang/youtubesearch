var React = require('react');
var PropTypes = require('prop-types');
var api = require('../utils/api');
var jssearch = require('js-search');
var axios = require('axios');
var ReactRouter = require('react-router-dom');
var Router = ReactRouter.BrowserRouter;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;
import '../static/css/search.css';

class VideoInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: '',
      searchTerm: ''
    }
    this.handleChangeId = this.handleChangeId.bind(this);
    this.handleChangeSearchTerm = this.handleChangeSearchTerm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChangeId(event) {
    var value = event.target.value;

    this.setState(function() {
      return {
        id: value
      }
    })
  }

  handleChangeSearchTerm(event) {
    var value = event.target.value;

    this.setState(function() {
      return {
        searchTerm: value
      }
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.id, this.state.searchTerm);
  }

  render () {
    var match = this.props.match
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          className='searchbar'
          id='video id'
          placeholder='Youtube ID'
          type="text"
          autoComplete='off'
          value={this.state.id}
          onChange={this.handleChangeId}
        />
        <input
          className='searchbar'
          id='video id'
          placeholder='Search term'
          type="text"
          autoComplete='off'
          value={this.state.searchTerm}
          onChange={this.handleChangeSearchTerm}
        />
        <button
          className='button'
          type='submit'
          disabled={!this.state.id || !this.state.searchTerm}>
            Search
        </button>
      </form>
    )
  }
}

function CommentList (props) {
  return (
    <ul>
      {props.comments.map(function (comment, index) {
        if (comment.snippet.hasOwnProperty('totalReplyCount')) {
          return (
            <Comment key={index} comment={comment} index={index}/>
          )
        }
        else {
          return (
            <Reply key={index} comment={comment} index={index}/>
          )
        }
      })}
    </ul>
  )
}

function Comment (props) {
  return (
    // <a href={'https://www.youtube.com/watch?v=' + props.comment.snippet.videoId + '&lc=' + props.comment.snippet.topLevelComment.id}>
    <div className="comment" key={props.comment.id}>
      <img
        className='avatar'
        src={props.comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
        alt={'Avatar for ' + props.comment.snippet.topLevelComment.snippet.authorDisplayName}
      />
      <a className='displayname' href={props.comment.snippet.topLevelComment.snippet.authorChannelUrl}>{props.comment.snippet.topLevelComment.snippet.authorDisplayName}</a>
      <p>{props.comment.snippet.topLevelComment.snippet.textOriginal}</p>
    </div>
    // </a>
  )
}

function Reply (props) {
  return (
    <div className="comment" key={props.comment.id}>
      <img
        className='avatar'
        src={props.comment.snippet.authorProfileImageUrl}
        alt={'Avatar for ' + props.comment.snippet.authorDisplayName}
      />
      <a className='displayname' href={props.comment.snippet.authorChannelUrl}>{props.comment.snippet.authorDisplayName}</a>
      <p>{props.comment.snippet.textOriginal}</p>
    </div>
  )
}



class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoID: null,
      searchTerm: null,
      comments: [],
      nextPageToken: null,
      videoThumbnail: null,
      percentage: null,
      commentCount: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.initializeInfo = this.initializeInfo.bind(this);
    this.getAllComments = this.getAllComments.bind(this);
  }

  handleSubmit(id, term) {
    this.initializeInfo (id, term);

  }

  initializeInfo(id, term) {
    api.fetchVideoDetails(id)
      .then(function(details) {
        // console.log(details);
        this.setState(function() {
          return {
            searchTerm: term,
            videoID: id,
            //videoThumbnail: details.items[0].snippet.thumbnails.standard.url,
            comments: [],
            nextPageToken: null,
            searchResults: [],
            commentCount: parseInt(details.items[0].statistics.commentCount, 10),
            percentage: .001
          }
        }.bind(this));
        this.getAllComments(id, term);
      }.bind(this));
  }

  getAllComments (id, term) {
    var promises = [];
    api.fetchComments(id, this.state.nextPageToken)
      .then(function(comments) {
        // console.log('main ' + this.state.comments);
        for (var i = 0, len = comments.items.length; i < len; i++) {
          var current = comments.items[i];
          if (current.snippet.totalReplyCount > 0) {
            if (current.replies.comments.length < current.snippet.totalReplyCount) {
              promises.push(api.fetchAllReplies(current.id));
              // api.fetchAllReplies(current.id)
              //   .then(function(replies) {
              //     console.log(replies);
              //     comments.items = comments.items.concat(replies);
              //   })
            }
            else {
              comments.items = comments.items.concat(comments.items[i].replies.comments);
            }
          }
        }
        axios.all(promises).then(function(results) {
          results.forEach(function(replies) {
            comments.items = comments.items.concat(replies);
          })
          console.log(comments.items);
          var search = new jssearch.Search('etag');
          search.addIndex(['snippet','topLevelComment','snippet','authorDisplayName']);
          search.addIndex(['snippet','topLevelComment','snippet','textOriginal']);
          search.addIndex(['snippet','textOriginal']);
          search.addIndex(['snippet','authorDisplayName']);
          search.addDocuments(comments.items);
          this.setState(function() {
            var newpercentage = this.state.percentage + comments.items.length/this.state.commentCount;
            if (newpercentage >= 1) {
              newpercentage = 1;
            }
            return {
              videoID: id,
              comments: this.state.comments.concat(comments.items),
              nextPageToken: comments.nextPageToken,
              searchResults: this.state.searchResults.concat(search.search(this.state.searchTerm)),
              percentage: newpercentage
            }
          }.bind(this));
          console.log(this.state.percentage);
          // console.log('one iteration');
          if (this.state.nextPageToken) {
            this.getAllComments(id, term);
          }
          else {
            // console.log('else ' + this.state.comments);
            this.setState(function() {
              return {
                videoID: id,
                searchTerm: term,
                nextPageToken: null,
                percentage: 1
              }
            }.bind(this));
            console.log(this.state.comments);
            // console.log('done');
          }
        }.bind(this));
      }.bind(this));
  }

  render() {
    return (
      <div>
        <VideoInput onSubmit={this.handleSubmit}/>
        {this.state.percentage && <LoadingBar percentage={this.state.percentage}/>}
          {this.state.searchResults && <CommentList comments={this.state.searchResults}/>}
      </div>
    )
  }
}

module.exports = Search;