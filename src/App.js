import React, { useState, useMemo } from 'react';
import { defaultData } from './data/trainingData';

const Current3yo4yo = () => {
  const [view, setView] = useState('predict');
  const [predictInputs, setPredictInputs] = useState({
    age: 3,
    spsAvg: 2.30,
    slAvg: 7.5
  });
  const [customData] = useState(null);

  const data = customData || defaultData;
  const data3yo = useMemo(() => data.filter(h => h.age === 3), [data]);
  const data4plus = useMemo(() => data.filter(h => h.age >= 4), [data]);

  const calculateModelStats = (dataset) => {
    const n = dataset.length;
    if (n < 10) return null;

    const distances = dataset.map(d => d.distance);
    const spsVals   = dataset.map(d => d.spsAvg);
    const slVals    = dataset.map(d => d.slAvg);

    // Correlation helpers (used for internal model diagnostics)
    const meanFn = arr => arr.reduce((a, b) => a + b, 0) / n;
    const correlation = (x, y) => {
      const mX = meanFn(x), mY = meanFn(y);
      const num = x.reduce((s, xi, i) => s + (xi - mX) * (y[i] - mY), 0);
      const dX  = Math.sqrt(x.reduce((s, xi) => s + Math.pow(xi - mX, 2), 0));
      const dY  = Math.sqrt(y.reduce((s, yi) => s + Math.pow(yi - mY, 2), 0));
      return num / (dX * dY);
    };
    const spsAvgCorr = correlation(spsVals, distances);
    const slAvgCorr  = correlation(slVals,  distances);

    // Build X matrix with polynomial term: [1, SPS, SL, SPS²]
    const X = dataset.map(d => [1, d.spsAvg, d.slAvg, d.spsAvg * d.spsAvg]);
    const y = distances;
    const k = 4;

    // XtX (4×4 matrix)
    const XtX = Array.from({ length: k }, (_, i) =>
      Array.from({ length: k }, (_, j) =>
        X.reduce((s, row) => s + row[i] * row[j], 0)
      )
    );

    // Xty (4×1 vector)
    const Xty = Array.from({ length: k }, (_, i) =>
      X.reduce((s, row, r) => s + row[i] * y[r], 0)
    );

    // Invert XtX using Gaussian elimination
    const invertMatrix = (M) => {
      const sz = M.length;
      const aug = M.map((row, i) => [
        ...row,
        ...Array.from({ length: sz }, (_, j) => (i === j ? 1 : 0))
      ]);
      for (let col = 0; col < sz; col++) {
        const pivot = aug[col][col];
        if (Math.abs(pivot) < 1e-12) return null;
        for (let c = 0; c < sz * 2; c++) aug[col][c] /= pivot;
        for (let row = 0; row < sz; row++) {
          if (row === col) continue;
          const factor = aug[row][col];
          for (let c = 0; c < sz * 2; c++) aug[row][c] -= factor * aug[col][c];
        }
      }
      return aug.map(row => row.slice(sz));
    };

    const XtXinv = invertMatrix(XtX);
    if (!XtXinv) return null;

    // Coefficients: β = (XtX)⁻¹ · Xty
    const coefficients = Array.from({ length: k }, (_, i) =>
      XtXinv[i].reduce((s, val, j) => s + val * Xty[j], 0)
    );

    // Predictions and R²
    const predictions = X.map(row =>
      row.reduce((s, val, i) => s + val * coefficients[i], 0)
    );
    const meanY  = meanFn(y);
    const ssRes  = y.reduce((s, yi, i) => s + Math.pow(yi - predictions[i], 2), 0);
    const ssTot  = y.reduce((s, yi)    => s + Math.pow(yi - meanY, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { spsAvgCorr, slAvgCorr, coefficients, rSquared, n };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats3yo = useMemo(() => calculateModelStats(data3yo), [data3yo]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats4plus = useMemo(() => calculateModelStats(data4plus), [data4plus]);

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
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center', fontFamily: 'Work Sans, sans-serif' }}>Current Performance Models</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '24px', borderRadius: '12px', border: '3px solid #0ea5e9', background: '#e0f2fe', textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' }}>3-Year-Olds</h3>
                {stats3yo ? (
                  <>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#0ea5e9' }}>{(stats3yo.rSquared * 100).toFixed(1)}%</div>
                    <p style={{ fontSize: '12px', color: '#666' }}>Model Accuracy R²</p>
                    <p style={{ fontSize: '12px', color: '#666' }}>Sample Size: {stats3yo.n} horses</p>
                  </>
                ) : (
                  <p style={{ color: '#999', fontSize: '14px' }}>Need 10+ horses</p>
                )}
              </div>

              <div style={{ padding: '24px', borderRadius: '12px', border: '3px solid #0ea5e9', background: '#e0f2fe', textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' }}>4+ Year-Olds</h3>
                {stats4plus ? (
                  <>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#0ea5e9' }}>{(stats4plus.rSquared * 100).toFixed(1)}%</div>
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
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: '#2C3E50', minHeight: '32px' }}>Age</label>
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
              const currentStats = predictInputs.age === 3 ? stats3yo : stats4plus;
              if (!currentStats) return <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>Not enough data</p>;

              // Polynomial model: intercept + b1*SPS + b2*SL + b3*SPS²
              const prediction =
                currentStats.coefficients[0] +
                currentStats.coefficients[1] * predictInputs.spsAvg +
                currentStats.coefficients[2] * predictInputs.slAvg +
                currentStats.coefficients[3] * predictInputs.spsAvg * predictInputs.spsAvg;

              return (
                <div style={{ background: '#e0f2fe', border: '3px solid #0ea5e9', borderRadius: '12px', padding: '32px', textAlign: 'center', marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>PREDICTED DISTANCE</p>
                  <p style={{ fontSize: '72px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '8px', lineHeight: '1' }}>{prediction.toFixed(1)}f</p>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>
                    {predictInputs.age === 3 ? '3-Year-Old' : '4+ Years'} • R²: {(currentStats.rSquared * 100).toFixed(1)}% • n={currentStats.n}
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