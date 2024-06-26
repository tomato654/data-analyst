import { useEffect, useState } from "react";
import { Modal, Button, Upload, List, message, Spin, Form, Table } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { axios_instance } from '@/utils'

const FilesManagement = ({initialValues , onChange, getFiles}) => {

    const [fileListGPT, setFileListGPT] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [fileUploaded, setFileUploaded] = useState(false);
    const [filesloading, setFilesloading] = useState(true);

    useEffect(() => {
        if(initialValues){
            setSelectedRowKeys(initialValues['file-ids'])
        }
    },[initialValues])

    useEffect(() => {
        const fetchFileList = async () => {
            try {
                const response = await axios_instance.get('/chat_gpt/file_action',{
                    params: {
                        action: 'list_files'
                    }
                });
                if(response.data.list.length > 0){
                    setFileListGPT(response.data.list);
                }
                else{
                    setFileListGPT([]);
                }
            } catch (error) {
                console.error("获取文件列表出错", error);
            }
        }
        setFilesloading(true)
        fetchFileList();
        setFileUploaded(false);
        setFilesloading(false);
    }, [fileUploaded]);
    
    const uploadProps = {
        name: 'file',
        action: 'http://127.0.0.1:8000/chat_gpt/upload_files',
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

    const deleteFileFromChatGPT = async (record) => {
        try {
            setFilesloading(true)
            const response = await axios_instance.get('/chat_gpt/file_action',{
                params: {
                    action: 'delete_file',
                    file_id: record.key
                }
            });
            console.log("删除文件", response.data)
            setFileUploaded(!fileUploaded)
            setFilesloading(false)
        } catch (error) {
            console.error("删除文件出错", error);
        }
    }

    const columns = [
        {
            title: 'File Name',
            dataIndex: 'filename',
            key: 'filename',
            width: 150,
        },
        {
            title: 'File ID',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Bytes',
            dataIndex: 'bytes',
            key: 'bytes',
            sorter: (a, b) => a.bytes - b.bytes,
            width: 70,
        },
        {
            title: 'Delete',
            key: 'delete',
            render: (_, record) => (
                <DeleteOutlined onClick={() => deleteFileFromChatGPT(record)} />
            ),
            width: 70,
        },
    ];

    const triggerChange = (changedValue) => {
        onChange?.(changedValue);
    }
    
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys, newSelectedRows) => {
            setSelectedRowKeys(newSelectedRowKeys)
            triggerChange(newSelectedRowKeys)
            if(getFiles){
                getFiles(newSelectedRows)
            }
        }
    };

    return(
        <div style={{width: '600px'}}>
            <Spin spinning={filesloading}>
                <Table 
                    rowSelection={{
                        type: "checkbox",
                        ...rowSelection,
                    }}
                    columns={columns} 
                    dataSource={fileListGPT}
                    pagination={false}
                    scroll={{
                        y: 200,
                    }}
                    size="small"
                />
                <Upload {...uploadProps} showUploadList={false} >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
            </Spin>
        </div>
    )
}

export default FilesManagement;