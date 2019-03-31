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
        numuniqueUsers: "",
        searchTerm: "",
        searchLoading: false,
        searchResults: []
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
    handleSearchChange = event => {
        this.setState({ searchTerm: event.target.value, searchLoading: true }, () => {
            this.handleSearchMessages()
        })
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages]
        const regex = new RegExp(this.state.searchTerm, "gi")
        const searchResults = channelMessages.reduce((acc, message) => {
            if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc
        }, [])

        this.setState({ searchResults })

        setTimeout(() => {
            this.setState({ searchLoading: false })
        }, 1000)
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

    displayMessages = messages =>
        messages.length > 0 &&
        messages.map(message => {
            return <Message key={message.timestamp} message={message} user={this.state.user} />
        })

    render() {
        const {
            messagesRef,
            messages,
            channel,
            user,
            progressBar,
            numuniqueUsers,
            searchTerm,
            searchResults,
            searchLoading
        } = this.state
        return (
            <>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numuniqueUsers={numuniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                />

                <Segment>
                    <Comment.Group className={progressBar ? "messages__progress" : "messages"}>
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
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
