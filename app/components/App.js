var React = require('react');
var Search = require('./Search')
import '../static/css/main.css';

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <Search />
      </div>
    )
  }
}

module.exports = App;