import React, { useState } from 'react';
import {  InputNumber , Slider, } from 'antd';

const App = ( { value, onChange, min, max, step } ) => {
    const triggerChange = (changedValue) => {
        onChange?.(changedValue);
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "auto auto"}}>
            <Slider
                min={min}
                max={max}
                onChange={(value) => triggerChange(value)}
                value={typeof value === 'number' ? value : 0}
                step={step}
                style={{ width: "300px" }}
            />
            <InputNumber
                min={min}
                max={max}
                style={{ margin: '0 16px' }}
                step={step}
                value={value}
                onChange={(value) => triggerChange(value)}
                changeOnWheel
            />
        </div>
    );
  };

  export default App;