import React, { Component } from 'react'
import Auth from './components/Auth'
import GetEvents from './components/GetEvents'
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
    MemoryRouter  as Router,
    Switch,
    Route
  } from "react-router-dom";

export default class App extends Component {

    render() {
        return (
            <Router>
                <div style = {{width: "785px", height: "550px"}}>
                    <Switch>
                        <Route exact path="/"> <Auth /> </Route>
                        <Route exact path="/GetEvents"> <Header/><GetEvents /> </Route>
                    </Switch>
                </div>
            </Router>
        )    

    }
}
