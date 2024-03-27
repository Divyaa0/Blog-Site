'use client';
import axios from 'axios';
import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); 
 
  const handleLogin = async (e:any) => {
    console.log("inside login function");
    e.preventDefault()
    try {
      const response = await axios.post('/api/jwt', { email, password });
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        const token=localStorage.getItem('token');
        // navigating to blog page
        // const response_blog = await axios.get('/api/jwt',{headers:{'Authorization':token}}); }
        // if(response.status===200)
        // {
        // router.push('/blog');
        // }
        verify_token(e);

      }else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Handle login error here
    }
 

  };

  const verify_token = async (e: any) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token not found');
      }
  
      const response = await axios.get('/api/jwt', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        router.push('/veiwBlogs');
      } else {
        throw new Error('Token verification failed');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      // Handle token verification error here
    }
  };
  

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '90vh',backgroundColor: '#f4f4f4' }}>

    <Form onSubmit={handleLogin} style={{ width: '450px', }} className='border p-3 rounded shadow'>
    <h2 className="mb-3">Login</h2>

      <Form.Group controlId="formBasicEmail " className='py-2'>
        <Form.Label>Email address</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword "className='py-2'>
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit" className='ms-2'>
        Login
      </Button>
    </Form>
    </Container>
  );
};

export default LoginForm;
