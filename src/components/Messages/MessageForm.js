import React, { Component } from "react"
import uuidv4 from "uuid-v4"
import firebase from "../../firebase"
import FileModal from "./FileModal"
import { Segment, Button, Input } from "semantic-ui-react"
import ProgressBar from "./ProgressBar"
import { Picker } from "emoji-mart"
import "emoji-mart/css/emoji-mart.css"
class MessageForm extends Component {
    state = {
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref("typing"),
        uploadState: "",
        uploadTask: null,
        percentUploaded: 0,
        message: "",
        user: this.props.currentUser,
        channel: this.props.currentChannel,
        errors: [],
        loading: false,
        modal: false,
        emojiPicker: false
    }

    componentWillMount() {
        if (this.state.uploadTask !== null) {
            this.state.uploadTask.cancel()
            this.setState({ uploadTask: null })
        }
    }

    openModal = () => {
        this.setState({ modal: true })
    }
    closeModal = () => {
        this.setState({ modal: false })
    }

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    handleKeyDown = event => {
        if (event.keyCode === 13) {
            this.sendMessage()
        }
        const { message, typingRef, channel, user } = this.state

        if (message) {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .set(user.displayName)
        } else {
            typingRef
                .child(channel.id)
                .child(user.uid)
                .remove()
        }
    }

    handleTogglePicker = () => {
        this.setState({ emojiPicker: !this.state.emojiPicker })
    }

    handleAddEmoji = emoji => {
        const oldMessage = this.state.message
        console.log(emoji)
        const newMessage = `${oldMessage} ${emoji.native}`
        this.setState({ message: newMessage })

        setTimeout(() => this.messageInputRef.focus(), 0)
    }

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        }

        if (fileUrl !== null) {
            message["image"] = fileUrl
        } else {
            message["content"] = this.state.message
        }
        return message
    }
    sendMessage = () => {
        const { getMessagesRef } = this.props
        const { message, channel, user, typingRef } = this.state
        if (message) {
            this.setState({ loading: true })
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({ loading: false, message: "", errors: [], emojiPicker: false })
                    typingRef
                        .child(channel.id)
                        .child(user.uid)
                        .remove()
                })
                .catch(err => {
                    console.log(err)
                    this.setState({
                        loading: false,
                        emojiPicker: false,
                        errors: this.state.errors.concat(err)
                    })
                    typingRef
                        .child(channel.id)
                        .child(user.uid)
                        .remove()
                })
        } else {
            this.setState({ errors: this.state.errors.concat({ message: "Add a message" }) })
        }
    }

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private/${this.state.channel.id}`
        } else {
            return "chat/public"
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id
        const ref = this.props.getMessagesRef()
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`
        this.setState(
            {
                uploadState: "uploading",
                uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
            },
            () => {
                this.state.uploadTask.on(
                    "state_changed",
                    snap => {
                        const percentUploaded = Math.round(
                            (snap.bytesTransferred / snap.totalBytes) * 100
                        )
                        this.props.isProgressBarVisible(this.state.uploadState)
                        this.setState({ percentUploaded })
                    },
                    err => {
                        console.log(err)
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: "error",
                            uploadTask: null
                        })
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        this.state.uploadTask.snapshot.ref
                            .getDownloadURL()
                            .then(downloadUrl => {
                                this.sendFileMessage(downloadUrl, ref, pathToUpload)
                            })
                            .catch(err => {
                                console.log(err)
                                this.setState({
                                    errors: this.state.errors.concat(err),
                                    uploadState: "error",
                                    uploadTask: null
                                })
                            })
                    }
                )
            }
        )
    }

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({ uploadState: "done" }, () => {
                    this.props.isProgressBarVisible(this.state.uploadState)
                })
            })
            .catch(err => {
                console.log(err)
                this.setState({
                    errors: this.state.errors.concat(err)
                })
            })
    }

    render() {
        const {
            errors,
            message,
            loading,
            modal,
            percentUploaded,
            uploadState,
            emojiPicker
        } = this.state
        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker
                        set="apple"
                        onSelect={this.handleAddEmoji}
                        className="emojipicker"
                        title="Pick your emoji"
                        emoji="point_up"
                    />
                )}
                <Input
                    fluid
                    name="message"
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    ref={node => (this.messageInputRef = node)}
                    value={message}
                    style={{ marginBottom: "0.7em" }}
                    label={
                        <Button
                            icon={emojiPicker ? "close" : "add"}
                            content={emojiPicker ? "Close" : null}
                            onClick={this.handleTogglePicker}
                        />
                    }
                    labelPosition="left"
                    className={
                        errors.some(error => error.message.includes("message")) ? "error" : ""
                    }
                    placeholder="Write your message"
                />

                <Button.Group icon widths="2">
                    <Button
                        color="orange"
                        disabled={loading}
                        content="Add Reply"
                        onClick={this.sendMessage}
                        labelPosition="left"
                        icon="edit"
                    />
                    <Button
                        color="teal"
                        disabled={uploadState === "uploading"}
                        onClick={this.openModal}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                    />
                </Button.Group>

                <FileModal
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded} />
            </Segment>
        )
    }
}

export default MessageForm
