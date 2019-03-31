import React, { Component } from "react"
import { Header, Segment, Input, Icon } from "semantic-ui-react"
class MessagesHeader extends Component {
    render() {
        const { channelName, numuniqueUsers, handleSearchChange, searchLoading, isPrivateChannel } = this.props
        return (
            <Segment clearing className='channel__header'>
                {/* Channel Tittle */}
                <Header fluid='true' as='h2' floated='left' style={{ marginBottom: 0 }}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && <Icon name={"star outline"} color='black' />}
                    </span>
                    <Header.Subheader>{numuniqueUsers}</Header.Subheader>
                </Header>

                {/* Channel Search */}
                <Header floated='right'>
                    <Input
                        onChange={handleSearchChange}
                        loading={searchLoading}
                        size='mini'
                        icon='search'
                        name='searchTerm'
                        placeholder='Search Messages'
                    />
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader
