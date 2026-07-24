import React, { useState } from 'react';
 
const TRACK_MODELS = {
  Carlisle:          { b0: 241.3096, b1: -156.3957, b2: -4.7794, b3: 30.2822, n: 165, r2: 76.10 },
  Chester:           { b0: 133.8191, b1: -67.6699, b2: -3.9198, b3: 11.0860, n: 147, r2: 89.20 },
  Doncaster:         { b0: 126.143, b1: -65.711, b2: -3.412, b3: 11.040, n: 260, r2: 76.57 },
  Epsom:             { b0: 126.3296, b1: -68.3779,  b2: -3.4308, b3: 12.2257,  n: 313, r2: 96.99 },
  Goodwood:          { b0: 275.8087, b1: -197.5548, b2: -3.0915, b3: 39.5758, n: 295, r2: 88.12 },
  York:              { b0: 198.4051, b1: -118.5363, b2: -4.3229, b3: 21.7015, n: 397, r2: 87.97 },
  'Ascot (Straight)': { b0: 97.332, b1: -44.930, b2: -3.194, b3: 7.018,  n: 305, r2: 90.76 },
  Pontefract:        { b0: 182.880, b1: -98.771, b2: -5.021, b3: 16.565,  n: 163, r2: 76.86 },
  Haydock:           { b0: 527.5982, b1: -264.3835, b2: -48.0935, b3: 23.0892, b4: 18.9158, n: 227, r2: 87.03 },
  Kempton:           { b0: 309.541, b1: -177.949, b2: -8.712, b3: 32.271, n: 407, r2: 80.12 },
  Ripon:             { b0: 68.7257, b1: -16.5715, b2: -3.6815, b3: 0.8997, n: 247, r2: 87.35 },
  Sandown:           { b0: 31.6375, b1: 11.0530, b2: -3.1165, b3: -5.0716, n: 207, r2: 69.81 },
  Salisbury:         { b0: 135.0788, b1: -61.3327, b2: -5.0166, b3: 9.4377, n: 259, r2: 81.79 },
  Southwell:         { b0: 525.2322, b1: -271.7301, b2: -44.7928, b3: 28.6818, b4: 16.8293, n: 201, r2: 91.29 },
  Windsor:           { b0: 134.1232, b1: -72.1726, b2: -3.3936, b3: 12.3567, n: 196, r2: 83.29 },
  Wolverhampton:     { b0: 654.912, b1: -352.292, b2: -53.848, b3: 39.556, b4: 20.641, n: 274, r2: 87.18 },
  Lingfield:         { b0: 459.564, b1: -270.563, b2: -28.340, b3: 37.714, b4: 10.598, n: 331, r2: 75.20 },
  Musselburgh:       { b0: 365.7160, b1: -259.9399, b2: -5.2925, b3: 52.5882, n: 137, r2: 90.90 },
  'Newbury (Straight)': { b0: 33.230, b1: 6.001, b2: -2.984, b3: -3.261, n: 182, r2: 86.03 },
  'Newcastle (Straight)': { b0: 96.8734, b1: -38.7571, b2: -3.6915, b3: 5.2610, n: 168, r2: 81.39 },
  'Newmarket Rowley': { b0: 97.5249, b1: -26.7433, b2: -4.8786, b3: 1.6839, n: 235, r2: 85.33 },
};
 
const GENERAL_MODELS = {
  Good: { b0: 242.3511, b1: -155.4955, b2: -4.3330, b3: 29.4332, b4: null, n: 234, r2: 84.75, label: 'Good' },
  GtF:  { b0: 219.3108, b1: -138.5441, b2: -3.9701, b3: 25.9627, b4: null, n: 142, r2: 86.34, label: 'Good to Firm' },
  GtS:  { b0: 255.1455, b1: -167.3730, b2: -3.8224, b3: 31.4426, b4: null, n: 194, r2: 83.70, label: 'Good to Soft' },
  Soft: { b0: 429.3964, b1: -217.9137, b2: -37.6538, b3: 21.3579, b4: 14.3386, n: 183, r2: 83.04, label: 'Soft' },
};
 
const TRACK_ROUTING = {
  'Ascot (Straight)': [
    { icon: '⚑', text: '7f predictions run ~0.5f long — adjust down' },
    { icon: '→', text: 'Round course races (7.97f+): use GM instead' },
    { icon: '→', text: 'Soft ground: use GM Soft' },
  ],
  Chester: [
    { icon: '→', text: '12.29f: use GM Good' },
    { icon: '→', text: 'GtF: use GM GtF (10f+ predictions lower confidence)' },
    { icon: '→', text: 'Soft: use GM Soft (7f structurally broken)' },
    { icon: '→', text: '15.89f: use GM + Min SPS correction' },
  ],
  Doncaster: [
    { icon: '⚑', text: 'Good/GtF — GtS/Soft route to GM' },
    { icon: '⚑', text: '10.2f: under-predicts ~0.9f' },
    { icon: '⚑', text: '11.9f: under-predicts ~1.3f' },
    { icon: '→', text: '14.52f: use GM + Min SPS correction' },
  ],
  Epsom: [
    { icon: '⚑', text: '8.51f on Good: lower confidence' },
    { icon: '→', text: 'Soft ground: use GM Soft' },
  ],
  Haydock: [
    { icon: '⚑', text: 'Good only — GtF/GtS/Soft route to GM' },
    { icon: '⚑', text: '7f: over-predicts ~0.7f' },
    { icon: '→', text: '13f+: use GM Good + Min SPS correction' },
  ],
  Kempton: [
    { icon: '⚑', text: 'Slowly run races: treat prediction with caution' },
    { icon: '→', text: '12f: use GM Good' },
    { icon: '⚑', text: '16f: track model + Min SPS correction' },
  ],
  Lingfield: [
    { icon: '⚑', text: '6f: over-predicts ~0.7f' },
    { icon: '→', text: '12f: use GM Good' },
  ],
  Pontefract: [
    { icon: '⚑', text: '5f predictions run ~0.5f long' },
    { icon: '⚑', text: '12f+: apply Min SPS correction' },
    { icon: '→', text: 'GtF / GtS / Soft: no reliable model — directional only' },
  ],
  Carlisle: [
    { icon: '⚑', text: '9f: lower confidence' },
    { icon: '⚑', text: '11.18f+: use GM + Min SPS correction' },
    { icon: '→', text: 'GtF: under-predicts ~0.3f at sprint/middle' },
    { icon: '→', text: 'GtS: unreliable — directional only' },
  ],
  Goodwood: [
    { icon: '→', text: '14f Good/GtF/GtS: use GM + Min SPS correction' },
    { icon: '→', text: '14f Soft: use GM Soft (no Min SPS needed)' },
    { icon: '⚑', text: '7f on GtS: over-predicts ~1.3f' },
    { icon: '⚑', text: 'GtS generally lower confidence' },
    { icon: '→', text: 'Soft ground (non-14f): use GM Soft' },
  ],
  Musselburgh: [
    { icon: '⚑', text: 'Good only — GtF/GtS/Soft route to GM' },
    { icon: '⚑', text: '7.07f: over-predicts ~0.65f' },
    { icon: '→', text: '12.47f+: use GM Good + Min SPS correction' },
  ],
  'Newcastle (Straight)': [
    { icon: '⚑', text: 'Straight course model only (5f, 6f, 7.06f, 8.02f)' },
    { icon: '⚠', text: '10.19f: no reliable prediction — biomechanical signal insufficient' },
    { icon: '→', text: '12.45f: use GM Good + Min SPS correction' },
    { icon: '→', text: '16.25f: use GM Good + Min SPS correction' },
  ],
  'Newmarket Rowley': [
    { icon: '⚑', text: 'Good only — GtF/GtS/Soft route to GM' },
    { icon: '⚑', text: '5f/7f: over-predicts ~0.5–0.7f' },
    { icon: '⚑', text: '12f: under-predicts ~0.6f' },
  ],
  Sandown: [
    { icon: '⚑', text: 'Good/GtF/GtS — Soft routes to GM Soft' },
    { icon: '⚑', text: '7f/8f: over-predicts ~0.7–0.8f' },
    { icon: '⚑', text: '9.95f: under-predicts ~1.3f' },
    { icon: '→', text: '14f: use GM Good + Min SPS correction' },
  ],
  Salisbury: [
    { icon: '⚑', text: '6f Good: over-predicts ~0.9f — treat as upper bound' },
    { icon: '→', text: '12.02f: use GM Good + Min SPS correction' },
    { icon: '→', text: 'Soft / GtS: use GM' },
  ],
  Southwell: [
    { icon: '⚑', text: '12.06f: directional (+0.6f bias)' },
    { icon: '→', text: '14.10f+: use GM Good (AW caveat — directional)' },
  ],
  'Newbury (Straight)': [
    { icon: '⚑', text: '5.15f predictions run ~0.35f long' },
    { icon: '→', text: 'Round course races (10f+): use GM instead' },
    { icon: '→', text: 'GtS / Soft: use GM' },
  ],
  Ripon: [
    { icon: '⚑', text: 'Good/GtF — GtS/Soft route to GM' },
    { icon: '⚑', text: '9.77f: under-predicts ~0.6f' },
    { icon: '→', text: '12.05f: use GM Good' },
    { icon: '→', text: '16f: use GM Good + Min SPS correction' },
  ],
  York: [
    { icon: '⚑', text: 'Good/GtF/GtS — Soft routes to GM Soft' },
    { icon: '⚑', text: '13.85f: use GM Good + Min SPS correction' },
  ],
  Wolverhampton: [
    { icon: '⚑', text: '12.23f: under-predicts ~0.6f (monitoring)' },
    { icon: '⚑', text: '14f: track model + Min SPS correction' },
  ],
  Windsor: [
    { icon: '⚑', text: 'Good/GtF — GtS routes to GM GtS, Soft to GM Soft' },
    { icon: '⚑', text: '8.14f: over-predicts ~1.1f' },
    { icon: '→', text: '11.45f: use GM Good + Min SPS correction' },
  ],
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
                if (m.b4) {
                  prediction += m.b4 * sps * sl;
                }
                modelLabel = track;
                r2 = m.r2;
                sampleN = m.n;
              } else {
                const gm = GENERAL_MODELS[going];
                prediction = gm.b0 + gm.b1 * sps + gm.b2 * sl + gm.b3 * sps * sps;
                if (gm.b4 !== null) {
                  prediction += gm.b4 * sps * sl;
                }
 
                modelLabel = gm.label;
                r2 = gm.r2;
                sampleN = gm.n;
              }
 
              const routing = isTrackModel ? TRACK_ROUTING[track] : null;
 
              return (
                <>
                  <div style={{ background: '#e0f2fe', border: '3px solid #0ea5e9', borderRadius: '12px', padding: '32px', textAlign: 'center', marginTop: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>PREDICTED DISTANCE</p>
                    <p style={{ fontSize: '72px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '8px', lineHeight: '1' }}>{prediction.toFixed(1)}f</p>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>
                      {modelLabel} • R²: {r2.toFixed(1)}% • n={sampleN}
                    </p>
                  </div>
                  {routing && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', marginTop: '12px', fontSize: '13px', color: '#475569' }}>
                      {routing.map((item, i) => (
                        <p key={i} style={{ margin: '3px 0', paddingLeft: '2px' }}>
                          <span style={{ color: item.icon === '⚑' ? '#d97706' : '#6366f1', marginRight: '6px', fontWeight: '600' }}>{item.icon}</span>
                          {item.text}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default Current3yo4yo;
 