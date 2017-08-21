var React = require('react');
var ReactRouter = require('react-router-dom');
var Router = ReactRouter.BrowserRouter;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;

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
        <Link
          className='button'
          to={{
            pathname: match.url + 'results',
            search: '?videoID=' + this.state.id + '&searchTerm=' + this.state.searchTerm
          }}>
          TESTING
        </Link>
      </form>
    )
  }
}

module.exports = VideoInput;