import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import { Router, Route, Switch } from "react-router-dom"
import Register from "./components/Auth/Register"
import Login from "./components/Auth/Login"
import firebase from "./firebase"
import history from './history'
import "semantic-ui-css/semantic.min.css"

class Root extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                history.push("/")
            }
        })
    }
    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Route path='/' exact component={App} />
                    <Route path='/login' exact component={Login} />
                    <Route path='/register' exact component={Register} />
                </Switch>
            </Router>
        )
    }
}

ReactDOM.render(<Root />, document.getElementById("root"))
