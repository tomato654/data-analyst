import React, {useState} from 'react';
import { Button, Result, message } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


const NotFound = ({ children }) => {
    const navigate = useNavigate();
    const [countDown, setCountDown] = useState(5)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountDown(countDown-1)
          }, 1000);
        setTimeout(() => {
            navigate('/', { replace: true });
            clearInterval(timer )
        }, 5000);
    });

    return (
        <Result
            status="404"
            title="Sorry, this page could not be found."
            subTitle={
                <>
                Sorry, this page could not be found..
                <br />
                Back to the home page in <span style={{fontWeight:600, color:'black'}}>{countDown}s</span>
                </>
            }
            extra={<Button type="primary" onClick={()=>navigate('/', { replace: true })}>Back to Homepage</Button>}
        />
    ) 
  }

  export default NotFound