import React from "react";
//import ReactDOM from "react-dom";
import "./Home.css";
import { Link } from "react-router-dom";

//  Eunhye:
//  TO DO: button css //Eunhye (Due 04/17)
//  TO DO: css and graphs on the bottom. compare to the state average. (Due 04/17)
//  TO DO: error handling when user input doesn't follow the correct format. <county>, <state> or the data is non-existent (Due 04/17)

//  Ash: 
//  TO DO: state avg backend (Due 04/17)

//  Future:
//  historical data


const counties = ["Ingham, Michigan", "Boulder, Colorado"];

class County extends React.Component {
  constructor(props) {
    super(props);

    this.items = counties;

    let search = window.location.search;
    let param = search.toString().split("=")[1].replace(/%20/g, " ");

    this.state = {
      isLoading: true,
      isStateLoading: true,
      county: param.split(", ")[0],
      state: param.split(", ")[1],
      location: "",
      countyStat: null,
      stateStat: null,
      prevState: undefined,
      prevCounty: undefined,
      suggestions: [],
    };

    this.refresh = this.refresh.bind(this);

    //console.log(this.state.county)
    //console.log(this.state.state)
  }

  async componentDidMount() {
    console.log(this.state.county, this.state.state);
    try {
      await fetch(
        `/countyCovid?county=${this.state.county}&state=${this.state.state}`
      ).then((response) =>
        response
          .json()
          .then((data) => ({
            data: data,
            status: response.status,
          }))
          .then((res) => {
            this.setState({ countyStat: res.data, isLoading: false });
            //console.log(this.state.countyStat)
          })
      );
    } catch (e) {
      this.setState({ found: false });
      alert(e);
    }
  }


  async componentDidUpdate() {
    if (this.state.prevCounty !== this.state.county) {
      try {
        await fetch(
          `/countyCovid?county=${this.state.county}&state=${this.state.state}`
        ).then((response) =>
          response
            .json()
            .then((data) => ({
              data: data,
              status: response.status,
            }))
            .then((res) => {
              this.setState({ countyStat: res.data, isLoading: false });
            })
        );
      } catch (e) {
        alert(e);
      }
      this.setState({
        prevCounty: this.state.county,
      });
    }

    if (this.state.prevState !== this.state.state) {
      try {
        await fetch(
          `/stateCovid?state=${this.state.state}`
        ).then((response) =>
          response
            .json()
            .then((data) => ({
              data: data,
              status: response.status,
            }))
            .then((res) => {
              this.setState({ stateStat: res.data, isStateLoading: false });
            })
        );
      } catch (e) {
        alert(e);
      }
      this.setState({
        prevState: this.state.state,
      });
    }
  }

  onTextChanged = (e) => {
    const value = e.target.value;
    let suggestions = [];
    if (value.length > 0) {
      const regex = new RegExp(`^${value}`, "i");
      suggestions = this.items.sort().filter((v) => regex.test(v));
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

  refresh() {
    let County = this.state.location.split(", ")[0];
    let State = this.state.location.split(", ")[1];

    this.setState({
      county: County,
      state: State,
    });
  }

  renderCountyStats() {
    return (
      <div className="centerStats">
        <div className="stats">
          confirmed: {this.state.countyStat.confirmed}
        </div>
        <div className="stats">deaths: {this.state.countyStat.deaths}</div>
        <div className="stats">
          recovered: {this.state.countyStat.recovered}
        </div>
        <div className="stats">
          last updated: {this.state.countyStat.lastUpdate}
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
            {this.state.county.toUpperCase()}, {this.state.state.toUpperCase()}{" "}
            <br></br>
            COVID19 Stats
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
           <button onClick={this.refresh}>
                   Enter
             </button>
          </div>
        </div>
        <div>
          {this.state.isLoading === false
            ? this.renderCountyStats()
            : ""}
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

export default County;
