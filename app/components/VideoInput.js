var React = require('react');
var ReactRouter = require('react-router-dom');
var Router = ReactRouter.BrowserRouter;
var Route = ReactRouter.Route;
var Link = ReactRouter.Link;
var Redirect = ReactRouter.Redirect;
var queryString = require('query-string');
import { Button, Form } from 'semantic-ui-react'

class VideoInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: '',
      searchTerm: '',
      redirect: false
    }
    this.handleChangeId = this.handleChangeId.bind(this);
    this.handleChangeSearchTerm = this.handleChangeSearchTerm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount () {
    if (!this.props.match.isExact) {
      var info = queryString.parse(this.props.location.search);
      var id = info.videoID;
      var term = info.searchTerm;
      this.setState(function() {
        return {
          id: id,
          searchTerm: term
        }
      });
    }
  }

  componentWillReceiveProps (nextprops) {
    this.setState({redirect: false});
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
    this.setState({redirect: true});
  }

  // <button
  //         className='button'
  //         type='submit'
  //         disabled={!this.state.id || !this.state.searchTerm}>
  //           Search
  //       </button>
  // <form onSubmit={this.handleSubmit}>
  //       <input
  //         className='searchbar'
  //         id='video id'
  //         placeholder='Youtube ID'
  //         type="text"
  //         autoComplete='off'
  //         value={this.state.id}
  //         onChange={this.handleChangeId}
  //       />
  //       <input
  //         className='searchbar'
  //         id='video id'
  //         placeholder='Search term'
  //         type="text"
  //         autoComplete='off'
  //         value={this.state.searchTerm}
  //         onChange={this.handleChangeSearchTerm}
  //       />
  //       <Link
  //         className='button'
  //         to={{
  //           pathname: match.url + 'results',
  //           search: '?videoID=' + this.state.id + '&searchTerm=' + this.state.searchTerm
  //         }}>
  //         Search
  //       </Link>
  //     </form>
  render () {
    var match = this.props.match;

    if (this.state.redirect) {
      return (
        <Redirect
          to={{
            pathname: match.url + 'results',
            search: '?videoID=' + this.state.id + '&searchTerm=' + this.state.searchTerm,
          }}
          push={true}/>
      )
    }

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Field>
          <label>Youtube Video ID</label>
          <input
            id='video id'
            placeholder='Youtube ID'
            type="text"
            autoComplete='off'
            value={this.state.id}
            onChange={this.handleChangeId}
          />
        </Form.Field>
        <Form.Field>
          <label>Search Term</label>
          <input
            id='video id'
            placeholder='Search term'
            type="text"
            autoComplete='off'
            value={this.state.searchTerm}
            onChange={this.handleChangeSearchTerm}
          />
        </Form.Field>
        <Button type='submit'>Submit</Button>
      </Form>
    )
  }
}

module.exports = VideoInput;