var React = require('react');
var PropTypes = require('prop-types');
var api = require('../utils/api');

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
        <label htmlFor='id'>
          Youtube ID
        </label>
        <input
          id='video id'
          placeholder='Video ID'
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
          <li key={comment.id}>
            <div>#{index + 1}</div>
            <ul>
              <li>
                <img
                  className='avatar'
                  src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
                  alt={'Avatar for ' + comment.snippet.topLevelComment.snippet.authorDisplayName}
                />
              </li>
              <li><a href={comment.snippet.topLevelComment.snippet.authorChannelUrl}>{comment.snippet.topLevelComment.snippet.authorDisplayName}</a></li>
              <li>{comment.snippet.topLevelComment.snippet.textOriginal}</li>
            </ul>
          </li>
        )
      })}
    </ul>
  )
}

class Popular extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoID: null,
      comments: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(id) {
    api.fetchYoutubeComments(id)
      .then(function(comments, id) {
        this.setState(function() {
          return {
            videoID: id,
            comments: comments
          }
        });
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

module.exports = Popular;