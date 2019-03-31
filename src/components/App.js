import React, { Component } from "react"
import { Grid } from "semantic-ui-react"
import ColorPanel from "./ColorPanel/ColorPanel"
import SidePanel from "./SidePanel/SidePanel"
import MetaPanel from "./MetaPanel/MetaPanel"
import Messages from "./Messages/Messages"
import { connect } from "react-redux"
import "./App.css"
class App extends Component {
    render() {
        return (
            <Grid columns='equal' className='app' style={{ background: "#f6f6f6" }}>
                <ColorPanel />
                <SidePanel key={this.props.currentUser && this.props.currentUser.uid} currentUser={this.props.currentUser} />

                <Grid.Column style={{ marginLeft: 320 }}>
                    <Messages
                        key={this.props.currentChannel && this.props.currentChannel.id}
                        currentChannel={this.props.currentChannel}
                        currentUser={this.props.currentUser}
                    />
                </Grid.Column>

                <Grid.Column width={4}>
                    <MetaPanel />
                </Grid.Column>
            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.user.currentUser,
    currentChannel: state.channel.currentChannel
})
export default connect(mapStateToProps)(App)
