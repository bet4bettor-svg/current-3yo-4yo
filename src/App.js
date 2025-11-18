import React, { useState, useMemo } from 'react';
import { defaultData } from './data/trainingData';

const Current3yo4yo = () => {
  const [view, setView] = useState('model-stats');
  const [predictInputs, setPredictInputs] = useState({
    age: 3,
    spsAvg: 2.30,
    slAvg: 7.5
  });
  const [customData, setCustomData] = useState(null);

  const data = customData || defaultData;
  const data3yo = useMemo(() => data.filter(h => h.age === 3), [data]);
  const data4plus = useMemo(() => data.filter(h => h.age >= 4), [data]);

  const calculateModelStats = (dataset) => {
    const n = dataset.length;
    if (n < 10) return null;
    
    const correlation = (x, y) => {
      const meanX = x.reduce((a, b) => a + b) / n;
      const meanY = y.reduce((a, b) => a + b) / n;
      const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
      const denX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
      const denY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
      return num / (denX * denY);
    };

    const distances = dataset.map(d => d.distance);
    const spsAvgCorr = correlation(dataset.map(d => d.spsAvg), distances);
    const slAvgCorr = correlation(dataset.map(d => d.slAvg), distances);

    const X = dataset.map(d => [1, d.spsAvg, d.slAvg]);
    const y = distances;
    
    const XtX = [
      [n, X.reduce((s, row) => s + row[1], 0), X.reduce((s, row) => s + row[2], 0)],
      [X.reduce((s, row) => s + row[1], 0), X.reduce((s, row) => s + row[1] * row[1], 0), X.reduce((s, row) => s + row[1] * row[2], 0)],
      [X.reduce((s, row) => s + row[2], 0), X.reduce((s, row) => s + row[1] * row[2], 0), X.reduce((s, row) => s + row[2] * row[2], 0)]
    ];
    
    const Xty = [
      y.reduce((s, yi) => s + yi, 0),
      X.reduce((s, row, i) => s + row[1] * y[i], 0),
      X.reduce((s, row, i) => s + row[2] * y[i], 0)
    ];

    const det = XtX[0][0] * (XtX[1][1] * XtX[2][2] - XtX[1][2] * XtX[2][1]) -
                XtX[0][1] * (XtX[1][0] * XtX[2][2] - XtX[1][2] * XtX[2][0]) +
                XtX[0][2] * (XtX[1][0] * XtX[2][1] - XtX[1][1] * XtX[2][0]);

    const inv = [
      [(XtX[1][1] * XtX[2][2] - XtX[1][2] * XtX[2][1]) / det,
       -(XtX[0][1] * XtX[2][2] - XtX[0][2] * XtX[2][1]) / det,
       (XtX[0][1] * XtX[1][2] - XtX[0][2] * XtX[1][1]) / det],
      [-(XtX[1][0] * XtX[2][2] - XtX[1][2] * XtX[2][0]) / det,
       (XtX[0][0] * XtX[2][2] - XtX[0][2] * XtX[2][0]) / det,
       -(XtX[0][0] * XtX[1][2] - XtX[0][2] * XtX[1][0]) / det],
      [(XtX[1][0] * XtX[2][1] - XtX[1][1] * XtX[2][0]) / det,
       -(XtX[0][0] * XtX[2][1] - XtX[0][1] * XtX[2][0]) / det,
       (XtX[0][0] * XtX[1][1] - XtX[0][1] * XtX[1][0]) / det]
    ];

    const coefficients = [
      inv[0][0] * Xty[0] + inv[0][1] * Xty[1] + inv[0][2] * Xty[2],
      inv[1][0] * Xty[0] + inv[1][1] * Xty[1] + inv[1][2] * Xty[2],
      inv[2][0] * Xty[0] + inv[2][1] * Xty[1] + inv[2][2] * Xty[2]
    ];

    const predictions = X.map(row => coefficients[0] + coefficients[1] * row[1] + coefficients[2] * row[2]);
    const meanY = y.reduce((a, b) => a + b) / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { spsAvgCorr, slAvgCorr, coefficients, rSquared, n };
  };

  const stats3yo = useMemo(() => calculateModelStats(data3yo), [data3yo]);
  const stats4plus = useMemo(() => calculateModelStats(data4plus), [data4plus]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f4f8, #e8f5e9)', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
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
              onClick={() => setView('model-stats')} 
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: view === 'model-stats' ? '2px solid #3498DB' : '2px solid #ddd',
                background: view === 'model-stats' ? '#E3F2FD' : '#f9f9f9',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2C3E50' }}>📊 3yo & 4+yo Model Stats</div>
            </button>
            
            <button 
              onClick={() => setView('predict')} 
              style={{
                padding: '16px',
                borderRadius: '8px',
                border: view === 'predict' ? '2px solid #27AE60' : '2px solid #ddd',
                background: view === 'predict' ? '#E8F8F5' : '#f9f9f9',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2C3E50' }}>🎯 Predict Current 3yo & 4+yo Optimal Distance</div>
            </button>
          </div>
        </div>

        {view === 'model-stats' && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', fontFamily: 'Work Sans, sans-serif' }}>Current Performance Models</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', border: '2px solid #3498DB', background: '#E3F2FD' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' }}>3-Year-Olds</h3>
                {stats3yo ? (
                  <>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3498DB' }}>{(stats3yo.rSquared * 100).toFixed(1)}%</div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Model Accuracy R²</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Sample Size: {stats3yo.n} horses</p>
                  </>
                ) : (
                  <p style={{ color: '#999', fontSize: '14px' }}>Need 10+ horses</p>
                )}
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', border: '2px solid #27AE60', background: '#E8F8F5' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' }}>4+ Year-Olds</h3>
                {stats4plus ? (
                  <>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#27AE60' }}>{(stats4plus.rSquared * 100).toFixed(1)}%</div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Model Accuracy R²</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Sample Size: {stats4plus.n} horses</p>
                  </>
                ) : (
                  <p style={{ color: '#999', fontSize: '14px' }}>Need 10+ horses</p>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'predict' && (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', fontFamily: 'Work Sans, sans-serif' }}>Predict Current Optimal Distance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50' }}>Age</label>
                <select 
                  value={predictInputs.age} 
                  onChange={(e) => setPredictInputs({...predictInputs, age: parseInt(e.target.value)})} 
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                >
                  <option value={3}>3yo</option>
                  <option value={4}>4+yo</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50' }}>Average SPS (Hz)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={predictInputs.spsAvg} 
                  onChange={(e) => setPredictInputs({...predictInputs, spsAvg: parseFloat(e.target.value)})} 
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50' }}>Average SL metres</label>
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
              const currentStats = predictInputs.age === 3 ? stats3yo : stats4plus;
              if (!currentStats) return <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>Not enough data</p>;

              const prediction = currentStats.coefficients[0] + currentStats.coefficients[1] * predictInputs.spsAvg + currentStats.coefficients[2] * predictInputs.slAvg;

              return (
                <div style={{ background: 'linear-gradient(to right, #E3F2FD, #E8F8F5)', padding: '24px', borderRadius: '8px', textAlign: 'center', border: '2px solid #3498DB' }}>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>PREDICTED DISTANCE</p>
                  <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#3498DB', marginBottom: '4px' }}>{prediction.toFixed(1)}f</p>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>R²: {(currentStats.rSquared * 100).toFixed(1)}% • Sample Size: {currentStats.n} horses</p>
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