import React, { useEffect, useState } from 'react';
import { Button, Tabs, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux'
import { setActiveId, fetchTabsInfo,  } from '@/store/modules/messages';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { axios_instance } from '@/utils'
import { setSelectedToUseCompany, setSelectedToUseModel  } from '@/store/modules/models';

const { confirm } = Modal;

const App = () => {
    const navigate = useNavigate()

    const dispatch = useDispatch()

    const [activeKey, setActiveKey] = useState();
    
    const currentID = useSelector( store => store.message.activeId )
    const tabsInfo = useSelector( store => store.message.tabsInfo );

    useEffect(()=>{
        const fetchTabs = async () => {
            await dispatch(fetchTabsInfo())
        }
        fetchTabs()
    },[])

    const showDeleteConfirm = (chat_id) => {
        confirm({
            title: 'Are you sure delete this tab?',
            cancelButtonProps: { style: { color: 'white', backgroundColor: 'rgb(255, 77, 79)' } },
            okText: 'Delete',
            okType: 'default',
            cancelText: 'CANCEL',
            onOk() {
                try {
                    axios_instance.get('/chats/delete_chat',{
                        params:{ chat_id: chat_id }
                    }).then(() =>{
                        dispatch(fetchTabsInfo())
                        dispatch(setActiveId(''))
                        navigate('/')
                    })
                }catch (error) {
                    console.log(error)
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    
    const renderTabsInfo = tabsInfo.map(tab => ({
        key: tab.key,
        label: (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', alignItems: 'center' }}>
            <span style={{ justifySelf: 'start' }}>{tab.label}</span>
            <DeleteOutlined style={{ justifySelf: 'end' }} onClick={() => showDeleteConfirm(tab.key)} />
        </div>
        )
    }));

    useEffect(()=>{
        setActiveKey(currentID)
    },[currentID])

    const onChange = (key) => {
        setActiveKey(key)
        navigate(`/c/${key}`)
        dispatch(setActiveId(key))
    };

    const add = () => {
        navigate('/')
        dispatch(setActiveId(''))
        dispatch(setSelectedToUseCompany("local-ai"))
    };

    return (
        <div>
            <div
                className='btn-wrap'
            >
                <Button onClick={add}>ADD</Button>
            </div>
            <Tabs
                className='sider-tablist'
                tabPosition='left'
                onChange = { onChange }
                activeKey={activeKey}
                type="card"
                items={renderTabsInfo}
            />
        </div>
    );
};
export default App;