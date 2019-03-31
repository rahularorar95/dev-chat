import React, { Component } from "react"
import firebase from "../../firebase"
import MessagesHeader from "./MessagesHeader"
import MessageForm from "./MessageForm"
import Message from "./Message"
import { Segment, Comment } from "semantic-ui-react"
class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref("messages"),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        progressBar: false,
        numuniqueUsers: ""
    }

    componentDidMount() {
        const { channel, user } = this.state
        if (channel && user) {
            this.addListeners(channel.id)
        }
    }

    componentDidUnMount() {
        this.removeListeners()
    }

    removeListeners = () => {
        this.state.messagesRef.off()
    }
    addListeners = channelId => {
        this.addMessageListener(channelId)
    }

    addMessageListener = channelId => {
        let loadedMessages = []
        this.state.messagesRef.child(channelId).on("child_added", snap => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })

            this.countUniqueUsers(loadedMessages)
        })
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name)
            }
            return acc
        }, [])

        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0
        const numuniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`

        this.setState({ numuniqueUsers })
    }

    isProgressBarVisible = uploadState => {
        if (uploadState === "uploading") {
            this.setState({ progressBar: true })
        } else {
            this.setState({ progressBar: false })
        }
    }

    displayChannelName = channel => (channel ? `#${channel.name}` : "")

    render() {
        const { messagesRef, messages, channel, user, progressBar, numuniqueUsers } = this.state
        return (
            <>
                <MessagesHeader channelName={this.displayChannelName(channel)} numuniqueUsers={numuniqueUsers} />

                <Segment>
                    <Comment.Group className={progressBar ? "messages__progress" : "messages"}>
                        {messages.length > 0 &&
                            messages.map(message => {
                                return <Message key={message.timestamp} message={message} user={this.state.user} />
                            })}
                    </Comment.Group>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                />
            </>
        )
    }
}

export default Messages
