import { Input, Button, Switch, Modal  } from 'antd';
import React, { useEffect, useState} from 'react';
import { RiseOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons';
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

    // 上传中
    const [ uploading, setUploading ] = useState(false)

    const currentID = useSelector( store => store.message.activeId )

    // useEffect(() => {
    //     console.log("selectedFiles改变了", selectedFiles)
    // },[selectedFiles])

    const submit = async () => {
        let aNewUserMsg = {  
            message: {
                role: 'user', 
                content: userInput,
            },
            modelPath: modelPath
        };
        if(selectedFiles.length > 0 && toUseCompany === 'openai-assistant' && webSearch === false){
            aNewUserMsg.message.files = selectedFiles
        }
        if(webSearch === true  && toUseCompany === 'openai'){
            aNewUserMsg.webSearch = true
        }
        if(currentID) {
            setUploading(true)
            aNewUserMsg.chat_id = currentID;
            await dispatch(sendUserMessage(aNewUserMsg));
            await setUserInput('');
            await dispatch(setUpdateMessageRender())
            await dispatch(sendUserMessageToBot(aNewUserMsg));
            await dispatch(setUpdateMessageRender())
            setUploading(false)

        }
        else {
            setUploading(true)
            const req = await axios_instance.post('/chats/update_chats',aNewUserMsg)
            await dispatch(fetchTabsInfo())
            await setUserInput('');
            await dispatch(setActiveId(req.data.chat_id))
            await navigate(`/c/${req.data.chat_id}`)
            aNewUserMsg.chat_id = await req.data.chat_id
            await dispatch(sendUserMessageToBot(aNewUserMsg))
            await dispatch(setUpdateMessageRender())
            setUploading(false)
        }
    }

    const onClick = async () => {
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

    const [isModalVisible, setIsModalVisible] = useState(false);
    

    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
    };


    return(
        <div className='submit-area'>
            
            { toUseCompany === 'openai-assistant' ? 
                <Button 
                    onClick={showModal} 
                    icon={<LinkOutlined />} 
                    className='submit-area-film-management-btn'
                />
                : null
            }
            <div className='submit-area-web-search'>
                <span>Web Search</span>
                <Switch disabled={disabledWebSearchSwitch} onChange={onChange}/>
            </div>
            
            

            <Modal
                title="Upload Files"
                open={isModalVisible}
                onCancel={handleCancel}
                width={650}
                className='submit-area-file-management-modal'
            >
                <FilesManagement getFiles={setSelectedFiles}/>
            </Modal>

            <TextArea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Message here..."
                autoSize={{
                    minRows: 1,
                    maxRows: 5,
                }}
            />
            { uploading ? 
                <Button className='submit-btn' tabIndex={0} icon={<LoadingOutlined />} disabled/> :
                <Button className='submit-btn' onClick={onClick} tabIndex={0} icon={<RiseOutlined />} />
            }
            
            {/* <Button onClick={testClick}></Button> */}
        </div>
        
    )
    

}

export default SubmitArea