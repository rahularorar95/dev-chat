import React, { Component } from "react"
import firebase from "../../firebase"
import { connect } from "react-redux"
import { setCurrentChannel, setPrivateChannel } from "../../actions"
import { Menu, Icon, Modal, Form, Input, Button } from "semantic-ui-react"

class Channels extends Component {
    state = {
        activeChannnel: "",
        user: this.props.currentUser,
        channels: [],
        channelName: "",
        channelDetails: "",
        channelsRef: firebase.database().ref("channels"),
        typingRef: firebase.database().ref("typing"),
        modal: false,
        firstLoad: true
    }

    componentDidMount() {
        this.addListeners()
    }

    componentWillUnmount() {
        this.removeListeners()
    }

    removeListeners = () => {
        this.state.channelsRef.off()
    }

    addListeners = () => {
        let loadedChannels = []
        this.state.channelsRef.on("child_added", snap => {
            loadedChannels.push(snap.val())
            this.setState({ channels: loadedChannels }, () => this.setFirstChannel())
        })
    }

    setFirstChannel = () => {
        const firstChannel = this.state.channels[0]
        if (this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
        }
        this.setState({ firstLoad: false })
    }

    closeModal = () => this.setState({ modal: false })

    openModal = () => this.setState({ modal: true })

    addChannel = () => {
        const { channelsRef, channelName, channelDetails, user } = this.state

        const key = channelsRef.push().key
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL
            }
        }
        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: "", channelDetails: "" })
                this.closeModal()
                console.log("channel Added")
            })
            .catch(err => {
                console.error(err)
            })
    }

    handleSubmit = event => {
        event.preventDefault()
        if (this.isFormValid(this.state)) {
            this.addChannel()
        }
    }

    isFormValid = ({ channelName, channelDetails }) => {
        return channelName && channelDetails
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    changeChannel = channel => {
        this.setActiveChannel(channel)
        this.state.typingRef
            .child(channel.id)
            .child(this.state.user.uid)
            .remove()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
    }

    setActiveChannel = channel => {
        this.setState({ activeChannnel: channel.id })
    }

    displayChannels = channels =>
        channels.length > 0 &&
        channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={() => this.changeChannel(channel)}
                name={channel.name}
                style={{ opacity: 0.7 }}
                active={channel.id === this.state.activeChannnel}
            >
                # {channel.name}
            </Menu.Item>
        ))

    render() {
        const { channels, modal } = this.state
        return (
            <>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>{" "}
                        ({channels.length}){" "}
                        <Icon
                            name="add"
                            inverted
                            onClick={this.openModal}
                            style={{ cursor: "pointer" }}
                        />
                    </Menu.Item>

                    {/* Channels */}
                    {this.displayChannels(channels)}
                </Menu.Menu>

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                />
                                <br />
                                <Input
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark" />
                            Add
                        </Button>

                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" />
                            Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </>
        )
    }
}

export default connect(
    null,
    { setCurrentChannel, setPrivateChannel }
)(Channels)
