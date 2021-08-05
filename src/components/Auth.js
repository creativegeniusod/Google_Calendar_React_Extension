/*global chrome*/
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';


export default class Auth extends Component {
    constructor(props){
        super(props)
        this.state = {signIn : localStorage.getItem('access_token') === null?false:true}
    }

    authenticate = () =>{
        let self = this;
        chrome.runtime.sendMessage({msg: "sigin"}, function(response) {
            console.log(typeof (response.msg)); 
            if (response.msg == "true") {
                chrome.runtime.onMessage.addListener(
                    function (request, sender, sendResponse) {
                        console.log(request);
                        if (request.msg === "signed in") {
                            self.setState({ signIn: true });
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
        if(this.state.signIn === true) {
            return <Redirect to="/GetEvents" />
             }
        return (
            
            <div className="container mx-auto text-center mt-5">
                <button className="btn btn-outline-secondary" onClick={this.authenticate}><img src="https://img.icons8.com/color/48/000000/google-logo.png"/> Signin with Google</button>
            </div>
        )
    }
}


