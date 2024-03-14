import React, { useEffect, useState} from 'react';
import { Layout  } from 'antd';
import MyTabs from './components/Tabs'
import SubmitArea from './components/SubmitArea'
import Login from './components/Login'
import UserInfo from './components/UserInfo';
import Message from './components/Message';
import ModelSelection from './components/modelSelection/ModelSelection'
import { auth } from '@/firebase'
import { useParams,useNavigate } from "react-router-dom"
import {  useDispatch } from 'react-redux'
import { setActiveId } from '@/store/modules/messages'
import { axios_instance } from '@/utils'
import './index.scss'
import { onAuthStateChanged } from 'firebase/auth';

const { Header, Content, Footer, Sider } = Layout;

const App = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const params = useParams()

  // 这一部分是为了实现假id查询，并跳转至NotFound
  const currentPageId = params.id
  useEffect(()=>{
    const verifyChatId = async () => {
      try {
        const req = await axios_instance.get('/chats/find_chat_id',{
          params:{chat_id:currentPageId}
        }) 
        await dispatch(setActiveId(currentPageId))
        await navigate(`/c/${currentPageId}`)
      } 
      catch (error) {
        console.error('Error fetching chat ID:', error);
        await navigate('/NotFound')
      }
    }
    if(currentPageId){
      verifyChatId()
    }
  },[])
  
  const [isLogined, setIsLogined] = useState(false)
  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, (user) =>{
      if(user) {
        setIsLogined(true)
      }else{
        setIsLogined(false)
      }
    })
    return () => unsubscribe()
  },[isLogined])


  return (
    <Layout className='home-container'>
      <div style={{width:'200px'}}>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          className='home-sidebar'
        >
          <MyTabs/>
        </Sider>
      </div>

      <Layout className='home-layout'>
        <Header className='layout-header'
          style={{
            padding: 0,
            backgroundColor: 'white',
          }}
        >
          <ModelSelection/>
          {/* { isLogined ? <UserInfo/> : <Login/> } */}
        </Header>


        <Content className='layout-content'
          style={{
            margin: '40px 40px 100px',
          }}
        >
          <div
            style={{
              minHeight: '100%',
              backgroundColor: 'white',
            }}
          >
            
            <Message/>
          </div>
        </Content>

        <Footer className='layout-footer'>
          <SubmitArea /> 
        </Footer>
        
      </Layout>
    </Layout>
  );
};
export default App;