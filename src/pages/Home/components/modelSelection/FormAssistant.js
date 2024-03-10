import React, { useEffect, useState } from 'react';


import { Select, Modal, Form,  Input, Cascader, Tooltip, Button, Upload, message, Spin, Divider, InputNumber } from 'antd';
import { InfoCircleOutlined, UploadOutlined, FileOutlined } from '@ant-design/icons';

import NumberSlider from './NumberSlider';
import { useDispatch, useSelector } from 'react-redux';
import { axios_instance } from '@/utils';
import FilesManagement from '../FilesManagement'; 

const { Option } = Select;

