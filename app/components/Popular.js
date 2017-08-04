var React = require('react');
var PropTypes = require('prop-types');
var api = require('../utils/api');

function SelectLanguage(props) {

  return (
    <form onSubmit="return {props.onSubmit}">
      Youtube ID:<br/>
      <input type="text"/><br/>
      <input type="submit" value="Submit"/>
    </form>
  )
}

class Popular extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      videoID: null,
      commenets: null
    };

    this.updateVideoID = this.updateVideoID.bind(this);
  }
  componentDidMount() {
  }
  updateVideoID(id) {
    this.setState(function () {
      return {
        videoID: id
      }
    });
    api.fetchYoutubeComments(this.state.videoID)
      .then(function(comments) {
        console.log(comments)
      })
  }
  test() {
    console.log("test");
    return false;
  }
  render() {
    return (
      <div>
        <SelectLanguage
          selectedLanguage={this.state.selectedLanguage}
          onSubmit={this.test}
        />
      </div>
    )
  }
}

module.exports = Popular;