/*global chrome*/
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom';

export default class Header extends Component {
    constructor(props){
        super(props)
        this.state = {signOut : false}
    }

    authenticate = () => {
        let self = this;
        chrome.runtime.sendMessage({msg: "sigout"}, function(response) {
            if (response.msg == "true"){
                chrome.runtime.onMessage.addListener(
                    function (request, sender, sendResponse) {
                        console.log(request);
                        if (request.msg === "signed out") {
                            self.setState({ signOut: true });
                            sendResponse({
                                msg: "OK"
                            });
                        }
                    }
                );
            }
          });
    }

    render() {
        if(this.state.signOut === true) {
            return <Redirect to="/" />
             }
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" >Calendar Events</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0 ml-auto">
                            <li className="nav-item">
                                <a className="nav-link active" style = {{cursor: "pointer"}} aria-current="page" onClick={this.authenticate} ><img src="https://img.icons8.com/fluency-systems-regular/48/000000/logout-rounded-left.png"/> Sign Out</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}
