import React, { Component } from "react"
import { Grid, Form, Segment, Button, Header, Message, Icon } from "semantic-ui-react"
import { Link } from "react-router-dom"
class Register extends Component {
    state = {}
    handleChange() {}
    render() {
        return (
            <Grid textAlign='center' verticalAlign='middle' className='app'>
                <Grid.Column style={{ maxWidth: 500 }}>
                    <Header as='h2' icon color='orange' textAlign='center'>
                        <Icon name='puzzle picec' color='orange' />
                        Register for DevChat
                    </Header>

                    <Form size='large'>
                        <Segment>
                            <Form.Input
                                fluid
                                name='username'
                                icon='user'
                                iconPosition='left'
                                placeholder='Username'
                                onChange={this.handleChange}
                                type='text'
                            />

                            <Form.Input
                                fluid
                                name='email'
                                icon='mail'
                                iconPosition='left'
                                placeholder='Email Address'
                                onChange={this.handleChange}
                                type='email'
                            />

                            <Form.Input
                                fluid
                                name='password'
                                icon='lock'
                                iconPosition='left'
                                placeholder='Password'
                                onChange={this.handleChange}
                                type='email'
                            />

                            <Form.Input
                                fluid
                                name='passwordConfirmation'
                                icon='lock'
                                iconPosition='left'
                                placeholder='Password Confirmation'
                                onChange={this.handleChange}
                                type='email'
                            />

                            <Button color='orange' fluid size='large'>
                                Submit
                            </Button>
                        </Segment>
                    </Form>

                    <Message>
                        Already a user? <Link to='/login'>Login</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register
