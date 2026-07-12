import React, { useState } from 'react';
 
const TRACK_MODELS = {
  Carlisle:          { b0: 241.3096, b1: -156.3957, b2: -4.7794, b3: 30.2822, n: 165, r2: 76.10 },
  Doncaster:         { b0: 156.260, b1: -85.012, b2: -4.057, b3: 14.688, n: 275, r2: 70.23 },
  Epsom:             { b0: 129.079, b1: -71.751,  b2: -3.329, b3: 13.014,  n: 195, r2: 96.23 },
  Goodwood:          { b0: 360.529, b1: -266.752, b2: -3.344, b3: 54.024,  n: 310, r2: 82.84 },
  York:              { b0: 224.725, b1: -143.358, b2: -3.863, b3: 26.832,  n: 463, r2: 85.29 },
  Ascot:             { b0: 317.542, b1: -222.246, b2: -3.481, b3: 42.977,  n: 356, r2: 80.76 },
  Pontefract:        { b0: 180.339, b1: -103.237, b2: -3.818, b3: 17.263,  n: 227, r2: 70.35 },
  Haydock:           { b0: 275.168, b1: -185.838, b2: -4.247, b3: 36.204,  n: 299, r2: 83.34 },
  Kempton:           { b0: 309.541, b1: -177.949, b2: -8.712, b3: 32.271, n: 407, r2: 80.12 },
  Ripon:             { b0: 68.7257, b1: -16.5715, b2: -3.6815, b3: 0.8997, n: 247, r2: 87.35 },
  Sandown:           { b0: 4.0163, b1: 33.2695, b2: -2.6377, b3: -10.1798, n: 249, r2: 68.78 },
  Windsor:           { b0: 136.717, b1: -74.255,  b2: -3.399, b3: 12.774,  n: 203, r2: 83.41 },
  Wolverhampton:     { b0: 190.262, b1: -97.624, b2: -6.325, b3: 16.640, n: 246, r2: 86.35 },
  Lingfield:         { b0: 196.658, b1: -112.300, b2: -4.804, b3: 19.757, n: 287, r2: 67.66 },
  Newbury:           { b0: 202.416, b1: -115.233, b2: -5.260, b3: 20.807, n: 290, r2: 84.50 },
  Newcastle:         { b0: 185.179, b1: -105.081, b2: -4.444, b3: 18.518, n: 241, r2: 83.30 },
  'Newmarket Rowley': { b0: 75.746, b1: -6.468, b2: -5.042, b3: -2.764, n: 229, r2: 83.85 },
};
 
const GENERAL_MODELS = {
  Good: { b0: 443.52, b1: -242.83, b2: -31.24, b3: 30.10, b4: 11.47, n: 218, r2: 84.41, label: 'Good' },
  GtF:  { b0: 516.02, b1: -276.36, b2: -40.28, b3: 30.76, b4: 15.48, n: 146, r2: 88.96, label: 'Good to Firm' },
  GtS:  { b0: 336.29, b1: -213.72, b2: -11.18, b3: 36.22, b4: 3.22,  n: 149, r2: 83.74, label: 'Good to Soft' },
  Soft: { b0: 474.83, b1: -238.83, b2: -43.60, b3: 21.90, b4: 16.91, n: 144, r2: 81.98, label: 'Soft' },
};
 
const Current3yo4yo = () => {
  const [view, setView] = useState('predict');
  const [track, setTrack] = useState('General');
  const [going, setGoing] = useState('Good');
  const [predictInputs, setPredictInputs] = useState({
    spsAvg: 2.30,
    slAvg: 7.5
  });
 
  const isTrackModel = track !== 'General' && TRACK_MODELS[track];
 
  const handleTrackChange = (newTrack) => {
    setTrack(newTrack);
    if (newTrack === 'General') {
      setGoing('Good');
    }
  };
 
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '32px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', color: '#2C3E50', fontFamily: 'Work Sans, sans-serif' }}>
            3yo & 4+yo Current Performance Model
          </h1>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
            For current 3-year-olds or mature horses (4 years+). Determine optimal distance from current stride mechanics.
          </p>
        </div>
 
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={() => setView('predict')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: view === 'predict' ? 'none' : '2px solid #e5e7eb',
                background: view === 'predict' ? '#2C3E50' : 'white',
                color: view === 'predict' ? 'white' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              🎯 Predict Distance
            </button>
 
            <button
              onClick={() => setView('model-stats')}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: view === 'model-stats' ? 'none' : '2px solid #e5e7eb',
                background: view === 'model-stats' ? '#2C3E50' : 'white',
                color: view === 'model-stats' ? 'white' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              📊 Model Stats
            </button>
          </div>
        </div>
 
        {view === 'model-stats' && (
          <>
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', fontFamily: 'Work Sans, sans-serif' }}>General Models</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {Object.entries(GENERAL_MODELS).map(([key, m]) => (
                  <div key={key} style={{ padding: '24px', borderRadius: '12px', border: '3px solid #0ea5e9', background: '#e0f2fe', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' }}>{m.label}</h3>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#0ea5e9' }}>{m.r2.toFixed(1)}%</div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Model Accuracy R²</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Sample Size: {m.n} horses</p>
                  </div>
                ))}
              </div>
            </div>
 
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', fontFamily: 'Work Sans, sans-serif' }}>Track-Specific Models</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {Object.entries(TRACK_MODELS)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([name, m]) => (
                  <div key={name} style={{ padding: '24px', borderRadius: '12px', border: '3px solid #2C3E50', background: '#f0f4f8', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' }}>{name}</h3>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2C3E50' }}>{m.r2.toFixed(1)}%</div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Model Accuracy R²</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Sample Size: {m.n} observations</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
 
        {view === 'predict' && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', fontFamily: 'Work Sans, sans-serif' }}>Predict Current Optimal Distance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isTrackModel ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50', minHeight: '32px' }}>Track</label>
                <select
                  value={track}
                  onChange={(e) => handleTrackChange(e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                >
                  <option value="General">General</option>
                  {Object.keys(TRACK_MODELS).sort().map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
 
              {!isTrackModel && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50', minHeight: '32px' }}>Going</label>
                  <select
                    value={going}
                    onChange={(e) => setGoing(e.target.value)}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                  >
                    <option value="Good">Good</option>
                    <option value="GtF">Good to Firm</option>
                    <option value="GtS">Good to Soft</option>
                    <option value="Soft">Soft</option>
                  </select>
                </div>
              )}
 
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50', minHeight: '32px' }}>Average SPS (Hz)</label>
                <input
                  type="number"
                  step="0.01"
                  value={predictInputs.spsAvg}
                  onChange={(e) => setPredictInputs({...predictInputs, spsAvg: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50', minHeight: '32px' }}>Average SL metres</label>
                <input
                  type="number"
                  step="0.01"
                  value={predictInputs.slAvg}
                  onChange={(e) => setPredictInputs({...predictInputs, slAvg: parseFloat(e.target.value)})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            </div>
 
            {(() => {
              const sps = predictInputs.spsAvg;
              const sl = predictInputs.slAvg;
              let prediction, modelLabel, r2, sampleN;
 
              if (isTrackModel) {
                const m = TRACK_MODELS[track];
                prediction = m.b0 + m.b1 * sps + m.b2 * sl + m.b3 * sps * sps;
                modelLabel = track;
                r2 = m.r2;
                sampleN = m.n;
              } else {
                const gm = GENERAL_MODELS[going];
                prediction = gm.b0 + gm.b1 * sps + gm.b2 * sl + gm.b3 * sps * sps + gm.b4 * sps * sl;
 
                modelLabel = gm.label;
                r2 = gm.r2;
                sampleN = gm.n;
              }
 
              return (
                <div style={{ background: '#e0f2fe', border: '3px solid #0ea5e9', borderRadius: '12px', padding: '32px', textAlign: 'center', marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>PREDICTED DISTANCE</p>
                  <p style={{ fontSize: '72px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '8px', lineHeight: '1' }}>{prediction.toFixed(1)}f</p>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    {modelLabel} • R²: {r2.toFixed(1)}% • n={sampleN}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Current3yo4yo;