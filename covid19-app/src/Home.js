import React from "react";
//import {ReactDOM} from "react-dom";
import "./Home.css";
import { ReactComponent as ReactMap } from "./Blank_US_Map.svg";
import $ from "jquery";
import { Link } from "react-router-dom";
//import { Button } from 'react-bootstrap';

//  Eunhye:
//  TO DO: have to click enter -Eunhye(04/17)
//  TO DO: error handling when user input doesn't follow the correct format. <county>, <state> or the data is non-existent (Due 04/17)

//  Ash:
//  DONE: Backend for suggestions -Ashley(04/17)
//  DONE: Out of 뭐시기, Unassigned 제외 -Ashley(04/17)

//  Future:
//  hover over, state name


const state_caps = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DC2: "District of Columbia",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};
//const counties = ["Ingham, Michigan", "Boulder, Colorado"];

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      usStatsLoading: true,
      stats: [],
      usStats: [],
      location: "",
      prevLocation: "",
      state: "",
      suggestions: [],
      counties: [],
    };

    try {
      fetch("/usCovid").then((response) =>
        response
          .json()
          .then((data) => ({
            data: data,
            status: response.status,
          }))
          .then((res) => {
            this.setState({ usStats: res.data, usStatsLoading: false });
            //console.log("US: ", this.state.usStats[0]);
          })
      );
    } catch (e) {
      alert(e);
    }
  }

  async componentDidMount() {
    try {
      await fetch("/allStateCovid").then((response) =>
        response
          .json()
          .then((data) => ({
            data: data,
            status: response.status,
          }))
          .then((res) => {
            this.setState({ stats: res.data, isLoading: false });
            //console.log(this.state.stats);
          })
      );
    } catch (e) {
      alert(e);
    }
  }

  renderUsMap() {
    let total_confirmed = this.state.usStats[0].confirmed;
    //let total_death = this.state.usStats[0].deaths;
    //let total_recovered = this.state.usStats[0].recovered;
    for (let i = 0; i < this.state.stats.length; i++) {
      let key = Object.keys(state_caps).find(
        (key) => state_caps[key] === this.state.stats[i]._id
      );
      let curr = this.state.stats[i].confirmed;
      if (curr / total_confirmed < 0.0025) {
        $(".map-img #" + key).css("fill", "rgba(255,0,0,0.15)");
        $("#0_0025").css("background-color", "rgba(255,0,0,0.15)");
      } else if (curr / total_confirmed < 0.00625) {
        $(".map-img #" + key).css("fill", "rgba(255,0,0,0.4)");
        $("#0_00625").css("background-color", "rgba(255,0,0,0.4)");
      } else if (curr / total_confirmed < 0.025) {
        $(".map-img #" + key).css("fill", "rgba(255,0,0,0.65)");
        $("#0_025").css("background-color", "rgba(255,0,0,0.65)");
      } else if (curr / total_confirmed < 0.3) {
        $(".map-img #" + key).css("fill", "rgba(230,0,0)");
        $("#0_3").css("background-color", "rgba(230,0,0)");
      } else {
        $(".map-img #" + key).css("fill", "rgba(139,0,0)");
        $("#last").css("background-color", "rgba(139,0,0)");
      }
      $(".map-img #" + key).on("click", function () {
        window.location.href = "/state?id=" + state_caps[key];
      });
    }
  }

  onTextChanged = (e) => {
    let countiesList = []
    this.state.counties.forEach(element => countiesList.push(element.city+", "+element.province))

    //console.log(countiesList)
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

  updateState(value) {
    this.setState({
      state: value,
    });
  }

  renderUsStats() {
    return (
      <div className="centerStats">
        <div className="stats">
          confirmed: {this.state.usStats[0].confirmed}
        </div>
        <div className="stats">deaths: {this.state.usStats[0].deaths}</div>
        <div className="stats">
          recovered: {this.state.usStats[0].recovered}
        </div>
        <div className="stats">
          last updated: {this.state.usStats[0].lastUpdate}
        </div>
      </div>
    );
  }

  render() {
    var confirmed_cases =
      this.state.usStatsLoading === false ? this.state.usStats[0].confirmed : 0;
    const { location } = this.state;
    return (
      <div>
        <div className="header">
          <h1 className="title">US COVID19 Stats</h1>
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
          {this.state.usStatsLoading === false
            ? this.renderUsStats()
            : "Loading..."}
        </div>
        <div className="map">
          {this.props.isLoading === true ? (
            "error"
          ) : (
            <ReactMap className="map-img" alt="map" />
          )}
          <div className="legend">
            <p>
              <span className="dot" id="0_0025"></span>
              <span className="range">
                -{Math.floor(confirmed_cases * 0.0025)}
              </span>
            </p>
            <p>
              <span className="dot" id="0_00625"></span>
              <span className="range">
                {Math.floor(confirmed_cases * 0.0025) + 1}-
                {Math.floor(confirmed_cases * 0.00625)}{" "}
              </span>
            </p>
            <p>
              <span className="dot" id="0_025"></span>
              <span className="range">
                {Math.floor(confirmed_cases * 0.00625) + 1}-
                {Math.floor(confirmed_cases * 0.025)}{" "}
              </span>
            </p>
            <p>
              <span className="dot" id="0_3"></span>
              <span className="range">
                {Math.floor(confirmed_cases * 0.025) + 1}-
                {Math.floor(confirmed_cases * 0.3)}
              </span>
            </p>
            <p>
              <span className="dot" id="last"></span>
              <span className="range">
                {Math.floor(confirmed_cases * 0.3) + 1}-
              </span>
            </p>
          </div>
        </div>
        <div>
          {this.state.usStatsLoading === false
            ? this.renderUsMap()
            : console.log("Map is Loading")}
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

export default Home;