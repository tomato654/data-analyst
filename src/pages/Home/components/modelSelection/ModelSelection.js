import { useEffect, useState } from 'react';
import { Select, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import './index.scss';
import ModalForm from './ModalForm';
import { axios_instance } from '@/utils'
import { setSelectedToUseCompany, fetchChildrenModels, fetchToUseModel, setSelectedToUseModel } from '@/store/modules/models';
import { setActiveId  } from '@/store/modules/messages';
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';


const App = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedSetting, setSelectedSetting] = useState('local-ai');  // 用户选中的设置公司
    const [companies, setCompanies] = useState([]); // 所有的公司                   
    const [openModal, setOpenModal] = useState(false); // 是否打开设置弹窗

    const selectedToUseCompany = useSelector(state => state.model.selectedToUseCompany)
    

    // 打开选中的公司的设置弹窗
    const handleSettingClick = async (e, option) => {
        e.stopPropagation();
        setSelectedSetting(option)
        setOpenModal(true)
    };

    // 获取所有的公司信息
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios_instance.get('/models/get_companies');
                const companiesData = response.data.map(element => ({
                    ...element,
                    name : element.label,
                    label: element.hasOwnProperty('label') ? (
                        <div style={{display:'grid', gridTemplateColumns: 'auto auto', alignItems: 'center' }}>
                            <span style={{ justifySelf: 'start' }} >{element.label}</span> 
                            <Button
                                type="text"
                                icon={<SettingOutlined />}
                                onClick={(e) => handleSettingClick(e, element)}
                                style={{ justifySelf: 'end'}}
                            />
                        </div>
                        ) : element.label
                }));
                setCompanies(companiesData);
            } catch (error) {
                console.error("获取公司信息出错", error);
            }
        };
        fetchCompanies();
    },[])

    // 获取选中公司的设置信息
    useEffect(() => {
        dispatch(fetchChildrenModels(selectedSetting.value))
    },[selectedSetting, dispatch])

    // 选中公司的回调函数
    const handleChange = async (value) => {
        setDefaultModel(value)
        await navigate('/')
        await dispatch(setActiveId(''))
        await dispatch(setSelectedToUseCompany(value))
    }

    useEffect(() => {
        dispatch(fetchToUseModel(selectedToUseCompany))
    },[selectedToUseCompany])

    const onCreate = async (values) => {
        if (selectedSetting.value === 'openai-assistant') {
            await axios_instance.post('/gpt_assistant/modify_assistant', values)
        }
        else{
            await axios_instance.post('/models/update_setting', {
                setting: {
                    ...values,
                },
                model: selectedSetting.value
            })
        }
        await setOpenModal(false);
    };

    const [defaultModel, setDefaultModel] = useState('local-ai');
    const activeId = useSelector( store => store.message.activeId )
    useEffect(() => {
        const fetchUsingModel = async () => {
            if(activeId) {
                const response = await axios_instance.get('/chats/get_chats',{
                    params: {
                        chat_id: activeId
                    }
                });
                setDefaultModel(response.data.model[0])
            }
            else{
                setDefaultModel('local-ai')
            }
        }
        fetchUsingModel()
    },[activeId])

    return(
        <div>
            <Select
                className="select-model"
                optionLabelProp="name"
                popupMatchSelectWidth={true}
                onChange={handleChange}
                options={companies}
                style={{ width: 150 , marginLeft: 20}}
                value={defaultModel}
            />

            <ModalForm 
                open={openModal} 
                selectedSetting={selectedSetting} 
                onCancel={() => setOpenModal(false)}
                onCreate={onCreate}
            />
        </div>
        
    )
}
export default App;


