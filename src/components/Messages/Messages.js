import React, { Component } from "react"
import firebase from "../../firebase"
import MessagesHeader from "./MessagesHeader"
import MessageForm from "./MessageForm"
import Message from "./Message"
import Typing from "./Typing"
import Skeleton from "./Skeleton"
import { Segment, Comment } from "semantic-ui-react"
class Messages extends Component {
    state = {
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref("privateMessages"),
        messagesRef: firebase.database().ref("messages"),
        messages: [],
        messagesLoading: true,
        channel: this.props.currentChannel,
        isChannelStarred: false,
        user: this.props.currentUser,
        usersRef: firebase.database().ref("users"),
        progressBar: false,
        numuniqueUsers: "",
        searchTerm: "",
        searchLoading: false,
        searchResults: [],
        typingUsers: [],
        typingRef: firebase.database().ref("typing"),
        connectedRef: firebase.database().ref(".info/connected"),
        listeners: []
    }

    componentDidMount() {
        const { channel, user, listeners } = this.state
        if (channel && user) {
            this.removeListeners(listeners)
            this.addListeners(channel.id)
            this.addUsersStarsListener(channel.id, user.uid)
        }
    }

    componentDidUpdate() {
        if (this.messagesEnd) {
            this.scrollToBottom()
        }
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" })
    }

    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event
        })

        if (index !== -1) {
            const newListener = { id, ref, event }
            this.setState({ listeners: this.state.listeners.concat(newListener) })
        }
    }

    componentWillUnmount() {
        this.removeListeners(this.state.listeners)
        this.state.connectedRef.off()
    }

    removeListeners = listeners => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event)
        })
    }

    addListeners = channelId => {
        this.addMessageListener(channelId)
        this.addTypingListeners(channelId)
    }

    addTypingListeners = channelId => {
        let typingUsers = []
        this.state.typingRef.child(channelId).on("child_added", snap => {
            if (snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({ typingUsers })
            }
        })

        this.addToListeners(channelId, this.state.typingRef, "child_added")

        this.state.typingRef.child(channelId).on("child_removed", snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key)
            if (index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snap.key)
                this.setState({ typingUsers })
            }
        })

        this.addToListeners(channelId, this.state.typingRef, "child_removed")

        this.state.connectedRef.on("value", snap => {
            if (snap.val()) {
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.user.uid)
                    .onDisconnect()
                    .remove(err => {
                        if (err !== null) {
                            console.error(err)
                        }
                    })
            }
        })
    }

    addUsersStarsListener = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child("starred")
            .once("value")
            .then(data => {
                if (data.val() !== null) {
                    const channelIds = Object.keys(data.val())
                    const prevStarred = channelIds.includes(channelId)
                    this.setState({ isChannelStarred: prevStarred })
                }
            })
    }

    addMessageListener = channelId => {
        let loadedMessages = []
        const ref = this.getMessagesRef()
        ref.child(channelId).on("child_added", snap => {
            loadedMessages.push(snap.val())
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })

            this.countUniqueUsers(loadedMessages)
        })
        this.setState({ messagesLoading: false })

        this.addToListeners(channelId, ref, "child_added")
    }

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel } = this.state
        return privateChannel ? privateMessagesRef : messagesRef
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
            if (
                (message.content && message.content.match(regex)) ||
                message.user.name.match(regex)
            ) {
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

    displayChannelName = channel => {
        return channel ? `${this.state.privateChannel ? "@" : "#"}${channel.name}` : ""
    }

    displayMessages = messages => {
        return (
            messages.length > 0 &&
            messages.map(message => {
                return <Message key={message.timestamp} message={message} user={this.state.user} />
            })
        )
    }

    handleStar = () => {
        this.setState(
            prevState => ({
                isChannelStarred: !prevState.isChannelStarred
            }),
            () => {
                this.starChannel()
            }
        )
    }

    starChannel = () => {
        if (this.state.isChannelStarred) {
            this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
                [this.state.channel.id]: this.state.channel
            })
        } else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if (err !== null) {
                        console.log(err)
                    }
                })
        }
    }

    displayTypingUsers = typingUsers =>
        typingUsers.length > 0 &&
        typingUsers.map(user => (
            <div
                style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
                key={user.id}
            >
                <span className="user__typing">{user.name} is typing</span>
                <Typing />
            </div>
        ))

    displayMessagesSkeleton = loading =>
        loading ? (
            <>
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} />
                ))}
            </>
        ) : null

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
            searchLoading,
            privateChannel,
            isChannelStarred,
            typingUsers,
            messagesLoading
        } = this.state
        return (
            <>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numuniqueUsers={numuniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel={privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
                />

                <Segment>
                    <Comment.Group className={progressBar ? "messages__progress" : "messages"}>
                        {this.displayMessagesSkeleton(messagesLoading)}
                        {searchTerm
                            ? this.displayMessages(searchResults)
                            : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node => (this.messagesEnd = node)} />
                    </Comment.Group>
                </Segment>

                <MessageForm
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isProgressBarVisible={this.isProgressBarVisible}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                />
            </>
        )
    }
}

export default Messages
