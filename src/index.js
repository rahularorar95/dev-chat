import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Register from './components/Auth/Register'
import Login from './components/Auth/Login'

const Root =()=>(
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={App} />
            <Route path="/login" exact component={Login} />
            <Route path="/register" exact component={Register} />
        </Switch>
    </BrowserRouter>
)

ReactDOM.render(<Root />, document.getElementById('root'));