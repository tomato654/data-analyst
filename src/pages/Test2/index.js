import React from 'react';
import { Form, Input, Select, Modal, Button } from 'antd';

const { Option } = Select;

const SettingForm = ({ visible, onCancel, onSave }) => {
  // 表单实例，用于操作表单数据
  const [form] = Form.useForm();

  // 表单提交的处理函数
  const handleSave = () => {
    form
      .validateFields()
      .then(values => {
        // 处理表单数据
        onSave(values);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    
    <>
        <Button></Button>
        <Modal
      title="Setting Model"
      maskClosable={false}
      onCancel={onCancel}

      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Model" name="model">
          <Input placeholder="Input your model name" />
        </Form.Item>
        <Form.Item label="API-Key" style={{ marginBottom: 0 }}>
          <Form.Item
            name="apiKey"
            rules={[{ required: true, message: 'Please input your API key!' }]}
            style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
          >
            <Input.Password placeholder="Input Your API-Key" />
          </Form.Item>
          <Form.Item
            name="expiration"
            style={{ display: 'inline-block', width: '50%', marginLeft: '8px' }}
          >
            <Select defaultValue="30m">
              <Option value="30m">In 30 minutes</Option>
              <Option value="1h">In 1 hour</Option>
              <Option value="12h">In 12 hours</Option>
              <Option value="1d">In 1 day</Option>
              <Option value="7d">In 7 days</Option>
              <Option value="30d">In 30 days</Option>
            </Select>
          </Form.Item>
        </Form.Item>
        {/* 补充其他表单项 */}
        <Form.Item label="Temperature" name="temperature">
          <Input type="number" placeholder="Temperature" />
        </Form.Item>
        <Form.Item label="Top P" name="topP">
          <Input type="number" placeholder="Top P" />
        </Form.Item>
        <Form.Item label="Frequency Penalty" name="frequencyPenalty">
          <Input type="number" placeholder="Frequency Penalty" step="0.1" />
        </Form.Item>
        <Form.Item label="Presence Penalty" name="presencePenalty">
          <Input type="number" placeholder="Presence Penalty" step="0.1" />
        </Form.Item>
        <Form.Item label="Prompt Prefix" name="promptPrefix">
          <Input placeholder="Prompt Prefix" />
        </Form.Item>
        {/* 补充结束 */}
      </Form>
    </Modal>
    </>
    
  );
};

export default SettingForm;