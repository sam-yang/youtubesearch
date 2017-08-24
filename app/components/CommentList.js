var React = require('react');
var PropTypes = require('prop-types');
var api = require('../utils/api');
var jssearch = require('js-search');
var axios = require('axios');
var ReactRouter = require('react-router-dom');
var Router = ReactRouter.BrowserRouter;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;
var queryString = require('query-string');
var CSSTransitionGroup = require('react-transition-group/CSSTransitionGroup')
import {Comment} from 'semantic-ui-react'
import '../static/css/search.css';

class CommentList extends React.Component {
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
    this.CancelToken = axios.CancelToken;
    this.source = this.CancelToken.source();
  }

  componentWillMount() {
    var info = queryString.parse(this.props.location.search);
    var id = info.videoID;
    var term = info.searchTerm;
    this.handleSubmit(id, term);
  }

  componentWillReceiveProps(nextprops) {
    this.source.cancel("New Search");
    this.source = this.CancelToken.source();
    this.forceUpdate();
    this.setState({searchResults: []});
    var info = queryString.parse(nextprops.location.search);
    var id = info.videoID;
    var term = info.searchTerm;
    this.handleSubmit(id, term);
  }

  handleSubmit(id, term) {
    this.initializeInfo (id, term);
  }


  initializeInfo(id, term) {
    api.fetchVideoDetails(id, this.source)
      .then(function(details) {
        this.setState(function() {
          console.log("resetting info!");
          return {
            searchTerm: term,
            videoID: id,
            videoDetails: details,
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
    api.fetchComments(id, this.state.nextPageToken, this.source)
      .then(function(comments) {
        // console.log('main ' + this.state.comments);
        for (var i = 0, len = comments.items.length; i < len; i++) {
          var current = comments.items[i];
          if (current.snippet.totalReplyCount > 0) {
            if (current.replies.comments.length < current.snippet.totalReplyCount) {
              promises.push(api.fetchAllReplies(current.id, this.source));
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
          // console.log(comments.items);
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
          // console.log(this.state.percentage);
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
             // console.log(this.state.comments);
             // console.log(this.state.searchResults);
            // console.log('done');
          }
        }.bind(this));
      }.bind(this));
  }
  render() {
    // console.log(this.state);
    // return (
    //   <div>
    //     {this.state.searchResults && <p>xd</p>}
    //   </div>
    // )

    return (
      <div>
        {this.state.videoDetails && <Thumbnail details={this.state.videoDetails}/>}
        {this.state.searchResults &&
        <div>
          <LoadingBar percentage={this.state.percentage}/>
          <Comment.Group>
          <CSSTransitionGroup
            transitionName="comment"
            transitionEnterTimeout={400}
            transitionLeaveTimeout={200}>

            {this.state.searchResults.map(function (comment, index) {
              if (comment.snippet.hasOwnProperty('totalReplyCount')) {
                return (
                  <Commentx key={index} comment={comment} index={index}/>
                )
              }
              else {
                return (
                  <Replyx key={index} comment={comment} index={index}/>
                )
              }
            })}
            </CSSTransitionGroup>
            </Comment.Group>

        </div>
      }
      </div>
    )
  }
}

// function Comment (props) {
//   return (
//     // <a href={'https://www.youtube.com/watch?v=' + props.comment.snippet.videoId + '&lc=' + props.comment.snippet.topLevelComment.id}>
//     <div className="comment" key={props.comment.id}>
//       <img
//         className='avatar'
//         src={props.comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
//         alt={'Avatar for ' + props.comment.snippet.topLevelComment.snippet.authorDisplayName}
//       />
//       <a className='displayname' href={props.comment.snippet.topLevelComment.snippet.authorChannelUrl}>{props.comment.snippet.topLevelComment.snippet.authorDisplayName}</a>
//       <p>{props.comment.snippet.topLevelComment.snippet.textOriginal}</p>
//     </div>
//     // </a>
//   )
// }

function Commentx (props) {
  return (
    <Comment>
      <Comment.Avatar src={props.comment.snippet.topLevelComment.snippet.authorProfileImageUrl} />
      <Comment.Content>
        <Comment.Author as='a'>{props.comment.snippet.topLevelComment.snippet.authorDisplayName}</Comment.Author>
        <Comment.Metadata>
          <div>Today at 5:42PM</div>
        </Comment.Metadata>
        <Comment.Text>{props.comment.snippet.topLevelComment.snippet.textOriginal}</Comment.Text>
        <Comment.Actions>
          <Comment.Action>Show Context</Comment.Action>
        </Comment.Actions>
      </Comment.Content>
    </Comment>
  )
}

function Replyx (props) {
  return (
    <Comment>
      <Comment.Avatar src={props.comment.snippet.authorProfileImageUrl} />
      <Comment.Content>
        <Comment.Author as='a'>{props.comment.snippet.authorDisplayName}</Comment.Author>
        <Comment.Metadata>
          <div>Today at 5:42PM</div>
        </Comment.Metadata>
        <Comment.Text>{props.comment.snippet.textOriginal}</Comment.Text>
        <Comment.Actions>
          <Comment.Action>Show Context</Comment.Action>
        </Comment.Actions>
      </Comment.Content>
    </Comment>
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

function LoadingBar (props) {
  const divStyle = {
    backgroundColor: '#8BC34A',
    width: props.percentage * 100 + '%',
    height: '5px',
    transition: '1s cubic-bezier(.37,.2,.47,.95)'
  }
  return (
    <div className="loadingbarwrapper">
      <div className="loadingbar" style={divStyle}></div>
    </div>
  )
}

function Thumbnail (props) {
  var x = props.details;
  console.log(Object.keys(x));

  return (
    <img src=''/>
  )
}
module.exports = CommentList;