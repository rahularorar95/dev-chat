import React from "react"
import moment from "moment"
import { Comment, Image } from "semantic-ui-react"

const isOwnMessage = (message, user) => {
    return message.user.id === user.uid ? "message__self" : ""
}
const timeFromNow = timestamp => moment(timestamp).fromNow()

const isImage = message => {
    return message.hasOwnProperty("image") && !message.hasOwnProperty("content")
}

const Message = ({ message, user }) => (
    <Comment>
        <Comment.Avatar src={user.photoURL} />
        <Comment.Content className={isOwnMessage(message, user)}>
            <Comment.Author as="a">{message.user.name}</Comment.Author>
            <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>

            {isImage(message) ? (
                <a
                    href={message.image}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="Open Image"
                >
                    <Image
                        style={{ height: "10em" }}
                        src={message.image}
                        className="message__image"
                    />
                </a>
            ) : (
                <Comment.Text>{message.content}</Comment.Text>
            )}
        </Comment.Content>
    </Comment>
)

export default Message
