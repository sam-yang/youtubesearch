var React = require('react');
var PropTypes = require('prop-types');
var api = require('../utils/api');
import '../static/css/search.css';

class VideoInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    var value = event.target.value;

    this.setState(function() {
      return {
        id: value
      }
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.id);
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
          onChange={this.handleChange}
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
      comments: null,
      nextPageToken: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(id) {
    api.fetchComments(id, this.state.nextPageToken)
      .then(function(comments) {
        this.setState(function() {
          return {
            videoID: id,
            comments: comments.items,
            nextPageToken: comments.nextPageToken
          }
        })
        console.log('one iteration');
        if (this.state.nextPageToken) {
        this.handleSubmit(id);
        }
        else {
          console.log('done');
        }
      }.bind(this));
  }

  render() {
    return (
      <div>
        <VideoInput
          onSubmit={this.handleSubmit}
        />
        {this.state.comments && <CommentList comments={this.state.comments}/>}
      </div>
    )
  }
}

module.exports = Search;