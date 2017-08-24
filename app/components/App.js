var React = require('react');
var Search = require('./Search');
var CommentList = require('./CommentList');
var VideoInput = require('./VideoInput');
var Results = require('./Results');
import '../static/css/main.css';
var ReactRouter = require('react-router-dom');
var Router = ReactRouter.BrowserRouter;
var Route = ReactRouter.Route;
var hashHistory = ReactRouter.hashHistory;

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className="container">
          <Route path='/' component={VideoInput} />
          <Route path='/results' component={CommentList} />
        </div>
      </Router>
    )
  }
}

module.exports = App;