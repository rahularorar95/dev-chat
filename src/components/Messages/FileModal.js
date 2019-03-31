import React, { Component } from "react"
import mime from "mime-types"
import { Modal, Input, Icon, Button } from "semantic-ui-react"
class FileModal extends Component {
    state = {
        file: null,
        fileFormats: ["image/jpeg", "image/png"]
    }

    addFile = event => {
        const file = event.target.files[0]
        if (file) {
            this.setState({ file })
        }
    }

    sendFile = () => {
        const { file } = this.state
        if (file !== null) {
            if (this.validateFile(file.name)) {
                const metadata = { contentType: mime.lookup(file.name) }
                this.props.uploadFile(file, metadata)
                this.props.closeModal()
                this.clearFile()
            }
        }
    }

    validateFile = filename => this.state.fileFormats.includes(mime.lookup(filename))

    clearFile = () => this.setState({ file: null })

    render() {
        return (
            <Modal basic open={this.props.modal} onClose={this.props.closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>

                <Modal.Content>
                    <Input onChange={this.addFile} fluid label='File types: jpg, png' name='file' type='file' />
                </Modal.Content>

                <Modal.Actions>
                    <Button onClick={this.sendFile} color='green' inverted>
                        <Icon name='checkmark' />
                        Send
                    </Button>

                    <Button onClick={this.props.closeModal} color='red' inverted>
                        <Icon name='remove' />
                        Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal
