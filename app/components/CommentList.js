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
import {TransitionMotion, spring} from 'react-motion'
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
      percentage: .001,
      commentCount: null,
      searchResults: [],
      videoDetails: null,
      items: []
    };

    this.initializeInfo = this.initializeInfo.bind(this);
    this.getAllComments = this.getAllComments.bind(this);
    this.CancelToken = axios.CancelToken;
    this.source = this.CancelToken.source();
  }

  componentDidMount() {
    console.log('componentDidMount');
    var info = queryString.parse(this.props.location.search);
    var id = info.videoID;
    var term = info.searchTerm;
    this.setState({
      items: [{key: 'a', size: 100}, {key: 'b', size: 200}, {key: 'c', size: 300}],
      searchTerm: term,
      videoID: id});
    this.initializeInfo(id, term);
  }

  componentWillReceiveProps(nextprops) {
    console.log('componentWillReceiveProps');
    console.log(this.props);
    console.log(nextprops);
    this.source.cancel("New Search");
    this.source = this.CancelToken.source();
    // this.forceUpdate();
    var info = queryString.parse(nextprops.location.search);
    var id = info.videoID;
    var term = info.searchTerm;
    this.setState({
      comments: [],
      searchResults: [],
      videoDetails: null,
      searchTerm: term,
      videoID: id});
    console.log(this.state);
    this.initializeInfo(id, term);
  }

  initializeInfo(id, term) {
    api.fetchVideoDetails(id, this.source)
      .then(function(details) {
        this.setState(function() {
          console.log("initalizing info");
          return {
            videoDetails: details,
            commentCount: parseInt(details.items[0].statistics.commentCount, 10)
          }
        }.bind(this));
        this.getAllComments(id, term);
      }.bind(this));
  }

  getAllComments (id, term) {
    console.log("getting new page of comments");
    var promises = [];
    api.fetchComments(id, this.state.nextPageToken, this.source)
      .then(function(comments) {
        // console.log(this.state.comments);
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
            var newSearchResults = this.state.searchResults.concat(search.search(this.state.searchTerm));
            return {
              videoID: id,
              comments: this.state.comments.concat(comments.items),
              nextPageToken: comments.nextPageToken,
              searchResults: newSearchResults,
              percentage: newpercentage
            }
          }.bind(this));
          // console.log(this.state.percentage);
          // console.log('one iteration');
          if (this.state.nextPageToken) {
            this.getAllComments(id, term);
          }
          else {
            this.setState(function() {
              return {
                videoID: id,
                searchTerm: term,
                nextPageToken: null,
                percentage: 1
              }
            }.bind(this));
             // console.log(this.state.comments);
             console.log(this.state.searchResults);
            // console.log('done');
          }
        }.bind(this));
      }.bind(this));
  }

  willLeave() {
    // triggered when c's gone. Keeping c until its width/height reach 0.
    return {width: spring(0, {stiffness: 107, damping: 18}), height: spring(0, {stiffness: 107, damping: 18})};
  }

  willEnter() {
    // triggered when c's gone. Keeping c until its width/height reach 0.
    return {width: 0, height: 0, opacity: 0, transform: 'translate3d(0, 0, 0)'};
  }

  render() {
    // return (
    //   <div>
    //     {this.state.searchResults && <p>xd</p>}
    //   </div>
    // )
    return (
      <div>
        {this.state.videoDetails && <Thumbnail key={this.state.videoDetails.items[0]} details={this.state.videoDetails}/>}
        {this.state.searchResults &&
        <div>
          <LoadingBar percentage={this.state.percentage}/>
          <CSSTransitionGroup
            transitionName="comment"
            transitionEnterTimeout={400}
            transitionLeaveTimeout={200}>

            {this.state.searchResults.map(function (comment, index) {
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
            </CSSTransitionGroup>
        </div>
      }
      </div>
    )
  }
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
  return (
    <div>
        <h2>{props.details.items[0].snippet.title}</h2>
        <img className='thumbnail' src={props.details.items[0].snippet.thumbnails.maxres.url} />
    </div>
  )
}
module.exports = CommentList;