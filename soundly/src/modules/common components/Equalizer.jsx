import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const Equalizer = ({ onChange, initialValues }) => {
  const [values, setValues] = useState({
    low: initialValues.low || 0,
    mid: initialValues.mid || 0,
    high: initialValues.high || 0
  });

  const bands = [
    { id: 'low', label: 'Низкие', icon: 'mdi:volume-low' },
    { id: 'mid', label: 'Средние', icon: 'mdi:volume-medium' },
    { id: 'high', label: 'Высокие', icon: 'mdi:volume-high' }
  ];

  useEffect(() => {
    setValues({
      low: initialValues.low || 0,
      mid: initialValues.mid || 0,
      high: initialValues.high || 0
    });
  }, [initialValues]);

  const handleChange = (band, value) => {
    const newValue = parseFloat(value);
    setValues(prev => ({ ...prev, [band]: newValue }));
    onChange(band, newValue);
  };

  return (
    <div className="equalizer-container">
      <h3>Эквалайзер</h3>
      <div className="equalizer-bands">
        {bands.map(band => (
          <div key={band.id} className="equalizer-band">
            <Icon icon={band.icon} className="eq-icon" />
            <label>{band.label}</label>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={values[band.id]}
              onChange={(e) => handleChange(band.id, e.target.value)}
            />
            <span className="eq-value">{values[band.id]} dB</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;