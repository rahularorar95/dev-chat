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
        user: this.props.currentUser
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
        })
    }

    render() {
        const { messagesRef, messages, channel, user } = this.state
        return (
            <>
                <MessagesHeader />

                <Segment>
                    <Comment.Group className='messages'>{messages.length > 0 && (
                        messages.map(message=>{
                            return <Message key={message.timestamp} message={message} user={this.state.user} />
                        })
                    )}</Comment.Group>
                </Segment>

                <MessageForm messagesRef={messagesRef} currentChannel={channel} currentUser={user} />
            </>
        )
    }
}

export default Messages
