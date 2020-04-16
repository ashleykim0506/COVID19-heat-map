import React from "react";
//import ReactDOM from "react-dom";
import "./Home.css";
import { Link } from "react-router-dom";

//  Eunhye:
//  TO DO: error handling when user input doesn't follow the correct format. <county>, <state> or the data is non-existent (Due 04/17)
//  TO DO: css and graphs on the bottom. compare to the national average. (Due 04/17)

//  Ash:
//  DONE: avg us (Due 04/17) -US has 50 states. Just divide the usStats[0] by 50.
//  DONE: pop up error bug (Due 04/17)

//  Future:
//  historical data

class State extends React.Component {
  constructor(props) {
    super(props);

    let search = window.location.search;
    let param = search.toString().split("=")[1].replace(/%20/g, " ");

    this.state = {
      isLoading: true,
      usStatsLoading: true,
      location: "",
      state: param,
      stateStat: [],
      usStats: [],
      suggestions: [],
      counties: [],
      prevLocation: "",
    };
  }

  async componentDidMount() {
    //console.log(this.state.state)
    try {
      await fetch(`/stateCovid?state=${this.state.state}`).then((response) =>
        response
          .json()
          .then((data) => ({
            data: data,
            status: response.status,
          }))
          .then((res) => {
            this.setState({ stateStat: res.data, isLoading: false });
            //console.log(this.state.stats);
          })
      );
    } catch (e) {
      alert(e);
    }

    try {
      await fetch(`/usCovid`).then((response) =>
        response
          .json()
          .then((data) => ({
            data: data,
            status: response.status,
          }))
          .then((res) => {
            this.setState({ usStats: res.data, usStatsLoading: false });
            //console.log(this.state.stats);
          })
      );
    } catch (e) {
      alert(e);
    }
  }

  onTextChanged = (e) => {
    let countiesList = []
    this.state.counties.forEach(element => countiesList.push(element.city+", "+element.province))

    const value = e.target.value;
    let suggestions = [];
    if (value.length > 0) {
      const regex = new RegExp(`^${value}`, "i");
      suggestions = countiesList.sort().filter((v) => regex.test(v));
    }
    this.setState(() => ({ suggestions, location: value }));
  };

  suggestionSelected(value) {
    this.setState(() => ({
      location: value,
      suggestions: [],
    }));
  }

  updateSuggestion(){
    if(this.state.prevLocation !== this.state.location){
      let c = this.state.location.split(", ")[0]
      let s = this.state.location.split(", ")[1]

     try {
        fetch(`/suggestions?county=${c}&state=${s}`).then((response) =>
          response
            .json()
            .then((data) => ({
              data: data,
              status: response.status,
            }))
            .then((res) => {
              if(res.data.length > 0){
                this.setState(() => ({counties: res.data }));
              }
            })
        );
      } catch (e) {
        alert(e);
      }
    }
  }

  renderSuggestions() {
    const { suggestions } = this.state;
    if (suggestions.length === 0) {
      return null;
    }
    return (
      <ul>
        {suggestions.map((item) => (
          <li onClick={() => this.suggestionSelected(item)}>{item}</li>
        ))}
      </ul>
    );
  }

  renderStateStats() {
    return (
      <div className="centerStats">
        <div className="stats">
          confirmed: {this.state.stateStat[0].confirmed}
        </div>
        <div className="stats">deaths: {this.state.stateStat[0].deaths}</div>
        <div className="stats">
          recovered: {this.state.stateStat[0].recovered}
        </div>
        <div className="stats">
          last updated: {this.state.stateStat[0].lastUpdate}
        </div>
      </div>
    );
  }

  render() {
    const { location } = this.state;
    return (
      <div>
        <div className="header">
          <div className="main">
            <Link to={`/`} className="to-main">
              To Main
            </Link>{" "}
          </div>
          <h1 className="title">
            {this.state.state.toUpperCase()} COVID19 Stats
          </h1>
          <div className="search-box">
            <form className="autocomplete">
              <input
                className="input-box"
                type="location"
                name="location"
                value={location}
                placeholder="County, State"
                onChange={this.onTextChanged}
                autoComplete="off"
              />
              {this.renderSuggestions()}
            </form>
            <Link
              to={`/county?id=${this.state.location}`}
              className="search-button"
            >
              Search
            </Link>
            {this.updateSuggestion()}
          </div>
        </div>
        <div className="centerStats">
          {this.state.isLoading === false ? this.renderStateStats() : ""}
        </div>
        <div className="link">
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/cases-in-us.html">
            {" "}
            Link to CDC{" "}
          </a>
        </div>
      </div>
    );
  }
}

export default State;