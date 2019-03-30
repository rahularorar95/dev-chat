import React from "react"
import ReactDOM from "react-dom"
import App from "./components/App"
import Spinner from "./components/Spinner"
import "semantic-ui-css/semantic.min.css"
import { Router, Route, Switch } from "react-router-dom"
import Register from "./components/Auth/Register"
import Login from "./components/Auth/Login"
import firebase from "./firebase"
import history from "./history"
import { createStore } from "redux"
import { Provider, connect } from "react-redux"
import { composeWithDevTools } from "redux-devtools-extension"
import rootReducer from "./reducers"
import { setUser, clearUser } from "./actions"

const store = createStore(rootReducer, composeWithDevTools())
class Root extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.props.setUser(user)
                history.push("/")
            } else {
                this.props.clearUser()
                history.push("/login")
            }
        })
    }
    render() {
        return this.props.isLoading ? (
            <Spinner />
        ) : (
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

const mapStateToProps = state => ({
    isLoading: state.user.isLoading
})

const RootWithConnect = connect(
    mapStateToProps,
    { setUser, clearUser }
)(Root)
ReactDOM.render(
    <Provider store={store}>
        <RootWithConnect />
    </Provider>,
    document.getElementById("root")
)
