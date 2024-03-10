import { Input, Button, Switch  } from 'antd';
import React, { useEffect, useState} from 'react';
import { RiseOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux'
import { axios_instance } from '@/utils'
import { fetchTabsInfo, sendUserMessage, sendUserMessageToBot, setActiveId, setUpdateMessageRender } from '@/store/modules/messages'
import { useNavigate } from 'react-router-dom';
import FilesManagement from './FilesManagement';
const { TextArea } = Input;

const SubmitArea = ( {sendSubmitAreaMsg}, props ) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [userInput, setUserInput] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [disabledWebSearchSwitch, setDisabledWebSearchSwitch] = useState(true);
    const [webSearch, setWebSearch] = useState(false)
    
    // 获取用户使用的模型
    const toUseCompany = useSelector( store => store.model.selectedToUseCompany )
    const toUseModel = useSelector( store => store.model.selectedToUseModel )
    const modelPath = [toUseCompany, ...toUseModel]

    const currentID = useSelector( store => store.message.activeId )

    const submit = async () => {
        let aNewUserMsg = {  
            message: {
                role: 'user', 
                content: userInput,
            },
            modelPath: modelPath
        };
        if(selectedFiles.length > 0 && toUseCompany === 'openai' && webSearch === false){
            aNewUserMsg.files = selectedFiles
        }
        if(webSearch === true  && toUseCompany === 'openai'){
            aNewUserMsg.webSearch = true
        }
    
        if(currentID) {
            aNewUserMsg.chat_id = currentID;
            await dispatch(sendUserMessage(aNewUserMsg));
            await dispatch(setUpdateMessageRender())
            await dispatch(sendUserMessageToBot(aNewUserMsg));
            await dispatch(setUpdateMessageRender())
            await setUserInput('');
        }
        else {
            const req = await axios_instance.post('/chats/update_chats',aNewUserMsg)
            await dispatch(fetchTabsInfo())
            await setUserInput('');
            await dispatch(setActiveId(req.data.chat_id))
            await navigate(`/c/${req.data.chat_id}`)
            aNewUserMsg.chat_id = await req.data.chat_id
            await dispatch(sendUserMessageToBot(aNewUserMsg))
            await dispatch(setUpdateMessageRender())
        }
    }

    const onClick = async () => {
        // console.log(selectedFiles)
        await submit()
    }

    useEffect(() => {
        if(toUseCompany === 'openai'){
            setDisabledWebSearchSwitch(false)
        }
        else{
            setDisabledWebSearchSwitch(true)
        }
    },[toUseCompany])

    const onChange = (checked) => {
        if(checked){
            setWebSearch(true)
        }
        else{
            setWebSearch(false)
        }
    }

    return(
        <div className='submit-area'>
            { toUseCompany === 'openai' ? <FilesManagement getFiles={setSelectedFiles}/> : null}
            <Switch disabled={disabledWebSearchSwitch} onChange={onChange} />
            <TextArea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Message here..."
                autoSize={{
                    minRows: 1,
                    maxRows: 5,
                }}
            />
            <Button type="primary" className='submit-btn' onClick={onClick} tabIndex={0} >
                <RiseOutlined />
            </Button>
        </div>
        
    )
    

}

export default SubmitArea