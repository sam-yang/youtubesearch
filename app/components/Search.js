var React = require('react');
var PropTypes = require('prop-types');
var api = require('../utils/api');
var jssearch = require('js-search');
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
          disabled={!this.state.id}>
            Submit
        </button>
      </form>
    )
  }
}

function CommentList (props) {
  return (
    <ul>
      {props.comments.map(function (comment, index) {
        return (
          <Comment key={index} comment={comment} index={index}/>
        )
      })}
    </ul>
  )
}

function Comment (props) {
  return (
    //<a href={'https://www.youtube.com/watch?v=' + props.comment.snippet.videoId + '&lc=' + props.comment.snippet.topLevelComment.id}>
      <div className="comment" key={props.comment.id}>
        <img
          className='avatar'
          src={props.comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
          alt={'Avatar for ' + props.comment.snippet.topLevelComment.snippet.authorDisplayName}
        />
        <a className='displayname' href={props.comment.snippet.topLevelComment.snippet.authorChannelUrl}>{props.comment.snippet.topLevelComment.snippet.authorDisplayName}</a>
        <p>{props.comment.snippet.topLevelComment.snippet.textOriginal}</p>
      </div>
    //</a>
  )
}

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoID: null,
      commentstemp: [],
      comments: [],
      nextPageToken: null,
      videoThumbnail: null,
      searchTerm: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(id, term) {
    api.fetchVideoDetails(id)
      .then(function(details) {
        console.log(details);
        this.setState(function() {
          return {
            videoThumbnail: details.items[0].snippet.thumbnails.standard.url
          }
        }.bind(this));
      }.bind(this));
    api.fetchComments(id, this.state.nextPageToken)
      .then(function(comments) {
        console.log('main ' + this.state.comments);
        this.setState(function() {
          return {
            videoID: id,
            comments: this.state.comments.concat(comments.items),
            nextPageToken: comments.nextPageToken
          }
        }.bind(this));
        console.log('one iteration');
        if (this.state.nextPageToken) {
          this.handleSubmit(id);
        }
        else {
          console.log('else ' + this.state.comments);
          this.setState(function() {
            return {
              videoID: id,
              // comments: this.state.comments.concat(comments.items),
              nextPageToken: null
            }
          }.bind(this));
          console.log('final ' + this.state.comments);
          console.log('done');
        }
      }.bind(this));
  }

  render() {
    return (
      <div>
        {this.state.videoThumbnail == null &&
          <VideoInput
            onSubmit={this.handleSubmit}
          />}
        {this.state.comments && <CommentList comments={this.state.comments}/>}
      </div>
    )
  }
}

module.exports = Search;