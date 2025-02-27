// see SignupForm.js for comments
import React, {useState} from 'react'
import {Alert, Button, Form} from 'react-bootstrap'

import Auth from '../utils/auth'
import {useMutation} from '@apollo/react-hooks'
import {LOGIN_USER} from '../utils/mutations'
import {getSavedBookIds, saveBookIds} from '../utils/localStorage'

const LoginForm = () => {
    const [loginUser] = useMutation(LOGIN_USER)
    const [userFormData, setUserFormData] = useState({email: '', password: ''})
    const [validated] = useState(false)
    const [showAlert, setShowAlert] = useState(false)

    const handleInputChange = (event) => {
        const {name, value} = event.target
        setUserFormData({...userFormData, [name]: value})
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault()

        // check if form has everything (as per react-bootstrap docs)
        const form = event.currentTarget
        if (form.checkValidity() === false) {
            event.preventDefault()
            event.stopPropagation()
        }

        try {
            const {data} = await loginUser({
                variables: userFormData
            })
            console.log(data)
            let savedBookIds = data.login.user?.savedBooks?.map(book => book.bookId) ?? []
            if (savedBookIds) {
                saveBookIds(savedBookIds)
            }
            console.log(getSavedBookIds())
            Auth.login(data.login.token)
        } catch (err) {
            console.error(err)
            setShowAlert(true)
        }

        setUserFormData({
            email: '',
            password: ''
        })
    }

    return (
        <>
            <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
                <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
                    Something went wrong with your login credentials!
                </Alert>
                <Form.Group>
                    <Form.Label htmlFor='email'>Email</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Your email'
                        name='email'
                        onChange={handleInputChange}
                        value={userFormData.email}
                        required
                    />
                    <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                    <Form.Label htmlFor='password'>Password</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder='Your password'
                        name='password'
                        onChange={handleInputChange}
                        value={userFormData.password}
                        required
                    />
                    <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
                </Form.Group>
                <Button
                    disabled={!(userFormData.email && userFormData.password)}
                    type='submit'
                    variant='success'>
                    Submit
                </Button>
            </Form>
        </>
    )
}

export default LoginForm
