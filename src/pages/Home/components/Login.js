import React, { useState } from 'react';
import { Button, Modal, Divider, Checkbox, Form, Input, message } from 'antd';
import { LockOutlined, MailOutlined, RightCircleOutlined } from '@ant-design/icons';
import { fetchLogin, setRemember } from '@/store/modules/user';
import {  useDispatch  } from 'react-redux'


import { createUserWithEmailAndPassword,signOut } from 'firebase/auth'
import { auth } from '@/firebase'

import './index.scss'

const loginLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
}
const signupLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
}


const LoginForm = ( {toSignUp,closeModal} ) => {
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    console.log("Login Form",values)
    const resultAction = await dispatch(fetchLogin(values))
    if (fetchLogin.fulfilled.match(resultAction)) {
        console.log("Login successful");
        await closeModal(false);
        await message.success('------------Login---------');
        await console.log(auth.currentUser)
    } else if (fetchLogin.rejected.match(resultAction)) {
        console.error("Login failed:", resultAction.payload);
        await message.error("Login failed: " + resultAction.payload);
    }
}

  const onChangeRemember = (e) => {
    dispatch(setRemember(e.target.checked))
  }

  return(
    <Form
      name="normal_login"
      className="login-form"
      onFinish={onFinish}
      validateTrigger='onBlur'
    >
      <Form.Item
        name="email"
        label="E-mail"
        rules={[
          {
            type: 'email',
            message: 'The input is not valid E-mail!',
          },
          {
            required: true,
            message: 'Please input your E-mail!',
          },
        ]}
        {...loginLayout}
      >
        <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: 'Please input your Password!',
          },
        ]}
        {...loginLayout}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>

      <Form.Item
        wrapperCol={{ offset: 6 }}
        style={{
          position: 'relative'
        }}
      >
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox onChange={onChangeRemember}>Remember me</Checkbox>
        </Form.Item>

        <Button 
          type="text"
          className="login-form-forgot" 
          size='small'
          style={{
            fontSize: '13px',
            position: 'absolute',
            right: '5px',
          }}
        >
          Forgot password?
        </Button>
      </Form.Item>

      <Form.Item
        wrapperCol={{ offset: 6 }}
      >
        <Button type="primary" htmlType="submit" className="login-form-button">
          Log in
        </Button>
        <span> Or </span>
        <span 
          onClick={ () => toSignUp(false) }
          style={{
            color: '#0958d9',
            cursor: 'pointer',
          }}
        >
          register now!
        </span>
      </Form.Item>
    </Form>
  )
  
}


const SignupForm = ( {toLogin} ) => {

  const onFinish = async (values) => {
    console.log("Sign Up Form",values)
    await createUserWithEmailAndPassword(auth, values.email, values.password)
    .then((userCredential) => {
        console.log("user created")
        message.success('------------Sign Up success---------')
        signOut(auth).then(() => {
          toLogin(true)
      })
    })
    .catch((error) => {
        message.error(error.code)
    });
}
  return(
    <Form
      name="normal_login"
      className="login-form"
      onFinish={onFinish}
    >
      <Form.Item
        name="email"
        label="E-mail"
        rules={[
          {
            type: 'email',
            message: 'The input is not valid E-mail!',
          },
          {
            required: true,
            message: 'Please input your E-mail!',
          },
        ]}
        {...signupLayout}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: 'Please input your Password!',
          },
        ]}
        hasFeedback
        {...signupLayout}
      >
        <Input.Password placeholder='Password'/>
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The new password that you entered do not match!'));
            },
          }),
        ]}
        {...signupLayout}
      >
        <Input.Password placeholder='Confirm Password'/>
      </Form.Item>

      <Form.Item
        style={{
          position: "relative"
        }}
      >
        <Button 
          type="primary" 
          htmlType="submit" 
          className="login-form-button"
          style={{
            position: "absolute",
            right: '90px'
          }}
        >
          Sign Up
        </Button>
        <Button 
          onClick={ () => toLogin(true) }
          style={{
            position: "absolute",
            right: '0px',
            border: 'none',
            boxShadow: 'none'
          }}
        >
          Login 
          <RightCircleOutlined 
            style={{
              margin: '0px 0px 0px 5px',
              position: 'relative',
              top: '1px'
            }}
          />
        </Button>
      </Form.Item>
    </Form>
  )
}



const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='login-btn'>
      <Button type="primary" onClick={showModal}>
        Login  
      </Button>
      <Modal
        title = {isLogin ? "Login" : "Signup" }
        open={isModalOpen} 
        onCancel={handleCancel} 
        maskClosable={false}
        footer={null}
        width={500}
      >
        <Divider orientation="left"></Divider>
        {
          isLogin ? <LoginForm toSignUp={setIsLogin} closeModal={setIsModalOpen} /> : <SignupForm toLogin={setIsLogin}/>
        }
        
      </Modal>
    </div>
  );
};
export default App;