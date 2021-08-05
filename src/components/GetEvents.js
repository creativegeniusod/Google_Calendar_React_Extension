/*global chrome*/
import React, { Component } from 'react'

export default class GetEvents extends Component {
    constructor(props) {
        super(props)
        this.state = {
            calendarId: '',
            calendarEvents: '',
        }

    }

    submitHandler = (e) => {
        let self = this;
        e.preventDefault();
        let calendarId = self.state.calendarId
        chrome.runtime.sendMessage({calendarId: calendarId}, function(response) {
            console.log(response);
            if (response.msg == "getting data") {
                chrome.runtime.onMessage.addListener(
                    function (request, sender, sendResponse) {
                        console.log(request);
                        if (request.events) {
                            self.setState(() => {
                                return {
                                    calendarEvents: request.events
                                };
                            });
                            sendResponse({
                                msg: "Got Data"
                            });
                        }
                    }
                );
            }
          });
        this.setState({ calendarId: "" });
    }

    getValue = (e) => {
        this.setState({ calendarId: e.target.value });
    }
    render() 
    {
        if (this.state.calendarEvents !== "") {
            var eventsArray = JSON.parse(this.state.calendarEvents);
        }
        return (
        
            <div className="container mt-4">
                <div className="row">
                    <div className="col-lg-5 mx-auto pt-4">
                        <form onSubmit={this.submitHandler}>
                            <div className="mb-3">
                                <label htmlFor="calendar_id" className="form-label">Calendar Id:</label>
                                <input type="text" value={this.state.calendarId} className="form-control" onChange={this.getValue} id="calendar_id" />
                            </div>
                            <button type="submit" className="btn btn-sm btn-success my-2">Submit</button>
                        </form>
                    </div>
                </div>
                <div className="row">
                    {
                        eventsArray ?
                            eventsArray.map((item, i) => {
                                var endDate = new Date(item.end.dateTime?item.end.dateTime:item.end.date)
                                var startDate = new Date(item.start.dateTime? item.start.dateTime:item.start.date)
                                return (
                                    <>
                                        <div className="col-sm-5 m-4">
                                            <div className="card" style={{ width: "18rem" }}>
                                                <div className="card-body">
                                                    <h5 className="card-title">Event Name: {item.summary}</h5>
                                                    <p className="card-text">Description: {item.description?item.description:"No Description"}</p>
                                                    <p  className="card-text">Start Date: {startDate.getFullYear()+'-' + (startDate.getMonth()+1) + '-'+startDate.getDate()+ ' '+startDate.getHours()+ ':'+startDate.getMinutes()}</p>
                                                    <p  className="card-text">End Date: {endDate.getFullYear()+'-' + (endDate.getMonth()+1) + '-'+endDate.getDate()+ ' '+endDate.getHours()+ ':'+endDate.getMinutes()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )

                            }) : ""
                    }
                </div>
            </div>
        )
    }
}
