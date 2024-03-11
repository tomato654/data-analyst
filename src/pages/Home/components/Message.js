import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { axios_instance } from '@/utils'
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css';
import { setSelectedToUseCompany, setSelectedToUseModel  } from '@/store/modules/models';



const Message = () =>{
    const dispatch = useDispatch()
    const currentChatId = useSelector( store => store.message.activeId )
    const updateMessage = useSelector( store => store.message.updateMessageRender )

    const [currentChat, setCurrentChat] = useState([])
    const [currentModel, setCurrentModel] = useState([])

    useEffect(()=>{
        const fetchChat = async () => {
            if(currentChatId) {
                const req = await axios_instance.get('/chats/get_chats',{
                    params:{chat_id:currentChatId}
                })
                console.log("asdfasdfas返回的消息",req.data)
                await setCurrentModel(req.data.model)
                await setCurrentChat(req.data.messages)
                await dispatch(setSelectedToUseCompany(req.data.model[0]))
                await dispatch(setSelectedToUseModel(req.data.model.slice(-2)))
            }
            else {
                setCurrentChat([])
            }
        }
        fetchChat()
    },[currentChatId, updateMessage])

    const UserMessage = (props) => {
        return(
            <div className="message-box-user">
                <div className='message-box-role'>You</div>
                <ReactMarkdown>{props.msg}</ReactMarkdown>
            </div>
        )
    }
  
    const AiMessage = (props) => {
        let companyName = ''
        if(currentModel[0] === 'openai'){
            companyName = 'Open AI'
        }
        else if (currentModel[0] === 'openai-assistant'){
            companyName = 'Assistant'
        }
        else {
            companyName = 'Local AI'
        }
        return(
            <div className="message-box-ai">
                <div className='message-box-role'>
                    {companyName}  
                    <span style={{ fontSize: '14px', marginLeft: '10px' }}>{currentModel[2]}</span> 
                </div>
                <div className="markdown-body">
                    <ReactMarkdown>{props.msg}</ReactMarkdown>
                    {   props.img ?
                        <img src={`data:image/png;base64,${props.img}`} alt="Description" />
                        : null
                    }
                </div>
              
            </div>
        )
    }


    const ConditionalRender = (props) => {
        if(props.item.role === 'user') {
            return <UserMessage msg={props.item.content}/>
        }
        else{
            return <AiMessage msg={props.item.content} img={props.item.image}/>
        }
    }

    return(
        <div className="message-box">
            {
              currentChat.length === 0 && !currentChat ? <span>A NEW CHAT</span> :
                  currentChat.map(
                      item => <ConditionalRender item={item} key={item.timestamp}/>
                  )
            }
        </div>
    )
}


export default Message