import React, { useEffect, useState } from 'react';


import { Select, Modal, Form,  Input, Cascader, Tooltip, Button, Upload, message, Spin, Divider, InputNumber } from 'antd';
import { InfoCircleOutlined, UploadOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { setSelectedToUseCompany, fetchChildrenModels, fetchToUseModel, setSelectedToUseModel } from '@/store/modules/models';

import NumberSlider from './NumberSlider';
import { useDispatch, useSelector } from 'react-redux';
import { axios_instance } from '@/utils';
import FilesManagement from '../FilesManagement';
import './index.scss';

const { confirm } = Modal;
const { Option } = Select;

const App = ( { open, onCreate, onCancel, selectedSetting } ) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    

    const filter = (inputValue, path) =>
        path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

    const [settingKeys, setSettingKeys] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [filesloading, setFilesloading] = useState(true);

    const cascaderOptions = useSelector( store => store.model.childrenModels );
    const savedSettings = useSelector( store => store.model.currentSetting );

    const [assistantOptions, setAssistantOptions] = useState([]);
    const assistantOnChange = async () => {
        await dispatch(fetchChildrenModels({assistant_id: form.getFieldValue('id')}))
    }

   
    const [createAssistant, setCreateAssistant] = useState(false);
    useEffect(() => {
        const fetchAssistantList = async () => {
            const res = await axios_instance.get('/gpt_assistant/assistant_list')
            const options = res.data.list.map(item => ({
                label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {item.value}
                        <DeleteOutlined onClick={() => showDeleteConfirm(item.value)}/>
                    </div>
                ),
                value: item.value,
                name: item.value
            }));
            setAssistantOptions(options)
        }
        fetchAssistantList()
    }, [createAssistant])

    const showDeleteConfirm = (id) => {
        confirm({
            title: 'Are you sure delete this tab?',
            cancelButtonProps: { style: { color: 'white', backgroundColor: 'rgb(255, 77, 79)' } },
            okText: 'Delete',
            okType: 'default',
            cancelText: 'CANCEL',
            onOk() {
                try {
                    axios_instance.get('/gpt_assistant/delete_assistant',{
                        params:{ assistant_id: id }
                    }).then(() =>{
                        setCreateAssistant(!createAssistant)
                        dispatch(fetchChildrenModels({reset: false}))
                        form?.resetFields();
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

    useEffect(() => {
        const keys = Object.keys(savedSettings);
        setSettingKeys(keys);
        form.setFieldsValue(savedSettings);
    }, [savedSettings, form]);

    useEffect(() => {
        const fetchFileList = async () => {
            const res = await axios_instance.get('/private-gpt/list_ingested_files');
            setFileList(res.data.data);
        }
        setFilesloading(true)
        fetchFileList();
        setFileUploaded(false);
        setFilesloading(false);
    }, [fileUploaded]);

    const uploadProps = {
        name: 'file',
        action: 'http://127.0.0.1:8000/private-gpt/upload_file',
        onChange(info) {
            setFilesloading(true)
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                setFilesloading(false)
                setFileUploaded(true);
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                setFilesloading(false)
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const renderPriceInfo = (price) => {
        return (
          <ul style={{ margin: 0, padding: 0 }}>
            {Object.entries(price).map(([key, value]) => (
              <li key={key}>
                {`${key}: ${value}`}
              </li>
            ))}
          </ul>
        );
    };

    const displayRender = (labels, selectedOptions) => {
        const lastOption = selectedOptions[selectedOptions.length - 1];
        if(!lastOption) return null;
        return(
            <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center" }}>
                <span style={{ justifySelf: "start" }}  >{labels[labels.length - 1]}</span>
                <Tooltip 
                    title={lastOption.hasOwnProperty('price') ? renderPriceInfo(lastOption.price) : 'No info'}
                >
                    <Button type="text" icon={<InfoCircleOutlined />}  style={{ justifySelf: "end" }}/>
                </Tooltip>
            </div>
        )
    };

    const modelValue = form.getFieldValue('model');
    const isPrivateGPT = Array.isArray(modelValue) && modelValue[0] === "private-gpt";

    const resetAssistant = async () => {
        await(dispatch(fetchChildrenModels({reset: false})))
        form?.resetFields();
    }

    return (
        <Modal
            open={open}
            maskClosable={false}
            title= {`Setting ${selectedSetting.label}`}
            onCancel={onCancel}
            destroyOnClose
            onOk={ async () => {
                const values = form?.getFieldsValue();
                await onCreate(values);
                if (selectedSetting.value === 'openai-assistant') {
                    setCreateAssistant(!createAssistant);
                }
            }}
            okText="Save"
            width={650}
        >
            <Divider orientation="left"></Divider>
            <Form
                initialValues={ savedSettings }
                form={form}
                className='setting-form'
                layout="vertical"
            >
                { settingKeys.includes("api-key") ?   <Form.Item label="API-Key">
                    <Form.Item 
                        name='api-key'
                        noStyle
                    >
                        <Input.Password 
                            placeholder="Input Your API-Key" 
                            addonAfter={
                                <Form.Item 
                                    name='expiration'
                                    noStyle
                                >
                                    <Select>
                                        <Option value="30m">Expires In 30 mintues</Option>
                                        <Option value="2h">Expires In 2 hours</Option>
                                        <Option value="12h">Expires In 12 hours</Option>
                                        <Option value="1d">Expires In 1 day</Option>
                                        <Option value="7d">Expires In 7 days</Option>
                                        <Option value="30d">Expires In 30 days</Option>
                                    </Select>
                                </Form.Item>
                            }
                        />
                    </Form.Item>
                </Form.Item> : null}

                { selectedSetting.value === 'openai-assistant' ? <Form.Item
                    label= "Assistant ID"
                    className='setting-form-item-assistant-id'
                >
                    <Form.Item name="id" className='setting-form-item-assistant-id-input'>
                        <Select placeholder="Input Your Assistant ID" options={assistantOptions} onChange={assistantOnChange} optionLabelProp="name"/>
                    </Form.Item>
                    <Button onClick={resetAssistant} type='primary'>NEW</Button>
                </Form.Item> : null}

                { selectedSetting.value === 'openai-assistant' ? <Form.Item
                    label= "Assistant Name"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Please input!',
                        },
                    ]}
                >
                    <Input placeholder="Input Your Assistant Name" />
                </Form.Item> : null}

                <Form.Item
                    label="Model"
                    name="model"
                >
                    <Cascader
                        options={cascaderOptions}
                        displayRender={displayRender}
                        expandTrigger="hover"
                        placeholder="Please select"
                        showSearch={{filter}}
                        onSearch={(value) => console.log(value)}
                    />
                </Form.Item>

                <Form.Item
                    label={ 
                        <div>
                            { selectedSetting.value === 'openai-assistant' ? <span>Instructions</span> : <span>Prompt Prefix</span>}
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: blank</span>
                            <Tooltip title="The prefix of the prompt">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    }
                    name="prompt-prefix"
                >
                    <Input.TextArea 
                        placeholder="Input your prompt"
                        autoSize={{ minRows: 3, maxRows: 5 }}
                    />
                </Form.Item>

                { settingKeys.includes("temperature") ?   <Form.Item 
                    name="temperature" 
                    label={ 
                        <div>
                            <span>Temperature</span>
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: 1</span>
                            <Tooltip title="The prefix of the prompt">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    } 
                    valuePropName="value"
                    getValueFromEvent={(value) => value}
                    className='setting-form-item-slider'
                >
                    <NumberSlider min={0} max={1} step={0.01}/>
                </Form.Item> : null}

                { settingKeys.includes("top-p") ? <Form.Item
                    label= { 
                        <div>
                            <span>Top P</span>
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: 0.8</span>
                            <Tooltip title="The prefix of the prompt">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    }
                    name="top-p"
                    valuePropName="value"
                    getValueFromEvent={(value) => value}
                >
                    <NumberSlider min={0} max={1} step={0.01}/>
                </Form.Item> : null}

               { settingKeys.includes("frequency-penalty") ? 
                <Form.Item
                    label= { 
                        <div>
                            <span>Frequency Penalty</span>
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: 0</span>
                            <Tooltip title="This parameter is used to discourage the model from repeating the same words or phrases too frequently within the generated text. It is a value that is added to the log-probability of a token each time it occurs in the generated text. A higher frequency_penalty value will result in the model being more conservative in its use of repeated tokens.">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    }
                    name="frequency-penalty"
                    valuePropName="value"
                    getValueFromEvent={(value) => value}
                >
                    <NumberSlider min={-2} max={2} step={0.01}/>
                </Form.Item> : null}

                { settingKeys.includes("presence-penalty") ? <Form.Item
                    label= { 
                        <div>
                            <span>Presence Penalty</span>
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: 0</span>
                            <Tooltip title="This parameter is used to encourage the model to include a diverse range of tokens in the generated text. It is a value that is subtracted from the log-probability of a token each time it is generated. A higher presence_penalty value will result in the model being more likely to generate tokens that have not yet been included in the generated text.">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    }
                    name="presence-penalty"
                    valuePropName="value"
                    getValueFromEvent={(value) => value}
                >
                    <NumberSlider min={-2} max={2} step={0.01}/>
                </Form.Item> : null }

                { settingKeys.includes("top-k") ? <Form.Item
                    label= { 
                        <div>
                            <span>Top K</span>
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: 40</span>
                            <Tooltip title="The prefix of the prompt">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    }
                    name="top-k"
                    valuePropName="value"
                    getValueFromEvent={(value) => value}
                >
                    <NumberSlider min={1} max={40} step={0.1}/>
                </Form.Item> : null}

                { settingKeys.includes("max-tokens") ? <Form.Item
                    label= { 
                        <div>
                            <span>Max Tokens Output</span>
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: 1024</span>
                            <Tooltip title="The prefix of the prompt">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    }
                    name="max-tokens"
                    valuePropName="value"
                    getValueFromEvent={(value) => value}
                >
                    <NumberSlider min={1} max={8192} step={1} />
                </Form.Item> : null}

                { settingKeys.includes("max-history") ? <Form.Item
                    label= { 
                        <div>
                            <span>Max History Resend</span>
                            <span style={{ color: "#333", fontSize: "12px", marginLeft: "4px" }}>default: 0</span>
                            <Tooltip title="How many lines of history chats do you want to resend as context for following conversation">
                                <InfoCircleOutlined style={{ marginLeft: "5px" }} />
                            </Tooltip>
                        </div>
                    }
                    name="max-history"
                >
                    <InputNumber placeholder={0} min={0} changeOnWheel />
                </Form.Item> : null}

                

                { isPrivateGPT ? <Form.Item
                    label= "Upload Files"
                    name="files"
                >
                    <Spin spinning={filesloading}>
                        <Upload {...uploadProps} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                        </Upload>
                        { fileList ? 
                            <ul style={{ margin: 0, padding: 0, listStyleType:'none', marginTop: '10px' ,display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                                {fileList.map(( fileName ,index) => {
                                    const id = String(index + 1)
                                    return(
                                        <li key={id}>
                                            <FileOutlined /><span>{fileName[0]}</span>
                                        </li>
                                    )
                                })}
                            </ul> 
                        : 
                            null}
                    </Spin>
                </Form.Item> : null}

                { selectedSetting.value === 'openai-assistant' ? <Form.Item
                    label= "Files Management"
                    name="file-ids"
                    valuePropName="value"
                    getValueFromEvent={(value) => value}
                >
                    <FilesManagement initialValues={ savedSettings } />
                </Form.Item> : null}

                
            </Form>
        </Modal>
    )
}

export default App;
