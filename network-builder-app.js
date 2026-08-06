const Icons = (() => {
  const base = (children, props) => (
    <svg
      viewBox="0 0 24 24"
      width={props.size || 16}
      height={props.size || 16}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );

  return {
    MousePointer2: (p) => base(<path d="M5 3l14 7-6 2-2 6-6-15z" />, p),
    CirclePlus: (p) => base(<>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>, p),
    Cable: (p) => base(<>
      <path d="M4 4v4a4 4 0 0 0 4 4h1" />
      <path d="M20 4v4a4 4 0 0 1-4 4h-1" />
      <path d="M9 12v3a3 3 0 0 0 3 3v0a3 3 0 0 0 3-3v-3" />
      <line x1="4" y1="2" x2="4" y2="6" />
      <line x1="20" y1="2" x2="20" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </>, p),
    Trash2: (p) => base(<>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>, p),
    Play: (p) => base(<path d="M6 3l15 9-15 9V3z" />, p),
    RotateCcw: (p) => base(<>
      <path d="M4 4v6h6" />
      <path d="M4.5 13a8 8 0 1 0 2-8.5L4 10" />
    </>, p),
    AlertTriangle: (p) => base(<>
      <path d="M12 3l10 18H2L12 3z" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </>, p),
    CheckCircle2: (p) => base(<>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </>, p),
    Zap: (p) => base(<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />, p),
    Activity: (p) => base(<path d="M3 12h4l2 8 4-16 2 8h6" />, p),
    Radio: (p) => base(<>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M5.5 5.5a9 9 0 0 0 0 13" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </>, p),
    GitCompare: (p) => base(<>
      <circle cx="6" cy="6" r="2.3" />
      <circle cx="18" cy="18" r="2.3" />
      <path d="M6 8.3V13a4 4 0 0 0 4 4h2" />
      <path d="M18 15.7V11a4 4 0 0 0-4-4h-2" />
    </>, p),
  };
})();
const { useState, useRef, useCallback } = React;
const { MousePointer2, CirclePlus, Cable, Trash2, Play, RotateCcw, AlertTriangle, CheckCircle2, Zap, Activity, Radio, GitCompare } = Icons;

const cx = (re, im = 0) => ({ re, im });
const cadd = (a, b) => cx(a.re + b.re, a.im + b.im);
const csub = (a, b) => cx(a.re - b.re, a.im - b.im);
const cmul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cconj = (a) => cx(a.re, -a.im);
const cabs = (a) => Math.hypot(a.re, a.im);
const cangle = (a) => Math.atan2(a.im, a.re);
const cdiv = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  return cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};

function buildYbus(buses, branches) {
  const n = buses.length;
  const idxOf = {};
  buses.forEach((b, i) => (idxOf[b.id] = i));
  const Y = Array.from({ length: n }, () => Array.from({ length: n }, () => cx(0, 0)));
  branches.forEach((br) => {
    const z = cx(br.r, br.x);
    const y = cdiv(cx(1, 0), z);
    const ysh = cx(0, (br.b || 0) / 2);
    const fi = idxOf[br.from], ti = idxOf[br.to];
    const a = br.isXfmr && br.tapRatio ? br.tapRatio : 1;
    if (a === 1) {
      Y[fi][fi] = cadd(Y[fi][fi], cadd(y, ysh));
      Y[ti][ti] = cadd(Y[ti][ti], cadd(y, ysh));
      Y[fi][ti] = csub(Y[fi][ti], y);
      Y[ti][fi] = csub(Y[ti][fi], y);
    } else {
      const yOverA = cdiv(y, cx(a, 0));
      const yOverA2 = cdiv(y, cx(a * a, 0));
      Y[fi][fi] = cadd(Y[fi][fi], cadd(yOverA2, ysh));
      Y[ti][ti] = cadd(Y[ti][ti], cadd(y, ysh));
      Y[fi][ti] = csub(Y[fi][ti], yOverA);
      Y[ti][fi] = csub(Y[ti][fi], yOverA);
    }
  });
  return { Y, idxOf };
}

function islandedBuses(buses, Y) {
  const n = buses.length;
  const rowSums = Y.map((row, i) => row.reduce((s, v, k) => (k === i ? s : s + cabs(v)), 0));
  return buses.filter((b, i) => rowSums[i] < 1e-9 && n > 1);
}

function calcPowerInjections(V, theta, Y) {
  const n = V.length;
  const P = new Array(n).fill(0), Q = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      const G = Y[i][k].re, B = Y[i][k].im;
      const ang = theta[i] - theta[k];
      P[i] += V[i] * V[k] * (G * Math.cos(ang) + B * Math.sin(ang));
      Q[i] += V[i] * V[k] * (G * Math.sin(ang) - B * Math.cos(ang));
    }
  }
  return { P, Q };
}

function buildJacobian(V, theta, Y, pvPqIdx, pqIdx) {
  const { P, Q } = calcPowerInjections(V, theta, Y);
  const npvpq = pvPqIdx.length, npq = pqIdx.length;
  const J11 = Array.from({ length: npvpq }, () => new Array(npvpq).fill(0));
  const J12 = Array.from({ length: npvpq }, () => new Array(npq).fill(0));
  const J21 = Array.from({ length: npq }, () => new Array(npvpq).fill(0));
  const J22 = Array.from({ length: npq }, () => new Array(npq).fill(0));

  pvPqIdx.forEach((i, a) => {
    pvPqIdx.forEach((k, b) => {
      const G = Y[i][k].re, B = Y[i][k].im;
      if (i === k) J11[a][b] = -Q[i] - B * V[i] * V[i];
      else { const ang = theta[i] - theta[k]; J11[a][b] = V[i] * V[k] * (G * Math.sin(ang) - B * Math.cos(ang)); }
    });
  });
  pvPqIdx.forEach((i, a) => {
    pqIdx.forEach((k, b) => {
      const G = Y[i][k].re, B = Y[i][k].im;
      if (i === k) J12[a][b] = P[i] / V[i] + G * V[i];
      else { const ang = theta[i] - theta[k]; J12[a][b] = V[i] * (G * Math.cos(ang) + B * Math.sin(ang)); }
    });
  });
  pqIdx.forEach((i, a) => {
    pvPqIdx.forEach((k, b) => {
      const G = Y[i][k].re, B = Y[i][k].im;
      if (i === k) J21[a][b] = P[i] - G * V[i] * V[i];
      else { const ang = theta[i] - theta[k]; J21[a][b] = -V[i] * V[k] * (G * Math.cos(ang) + B * Math.sin(ang)); }
    });
  });
  pqIdx.forEach((i, a) => {
    pqIdx.forEach((k, b) => {
      const G = Y[i][k].re, B = Y[i][k].im;
      if (i === k) J22[a][b] = Q[i] / V[i] - B * V[i];
      else { const ang = theta[i] - theta[k]; J22[a][b] = V[i] * (G * Math.sin(ang) - B * Math.cos(ang)); }
    });
  });

  const n = npvpq + npq;
  const J = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let r = 0; r < npvpq; r++) {
    for (let c = 0; c < npvpq; c++) J[r][c] = J11[r][c];
    for (let c = 0; c < npq; c++) J[r][npvpq + c] = J12[r][c];
  }
  for (let r = 0; r < npq; r++) {
    for (let c = 0; c < npvpq; c++) J[npvpq + r][c] = J21[r][c];
    for (let c = 0; c < npq; c++) J[npvpq + r][npvpq + c] = J22[r][c];
  }
  return J;
}

function gaussSolve(A, b) {
  const n = b.length;
  const M = A.map((row) => row.slice());
  const x = b.slice();
  for (let col = 0; col < n; col++) {
    let maxRow = col, maxVal = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > maxVal) { maxVal = Math.abs(M[r][col]); maxRow = r; }
    if (maxVal < 1e-13) throw new Error("singular");
    if (maxRow !== col) { [M[col], M[maxRow]] = [M[maxRow], M[col]]; [x[col], x[maxRow]] = [x[maxRow], x[col]]; }
    const pivot = M[col][col];
    for (let r = col + 1; r < n; r++) {
      const factor = M[r][col] / pivot;
      for (let c = col; c < n; c++) M[r][c] -= factor * M[col][c];
      x[r] -= factor * x[col];
    }
  }
  const sol = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = x[r];
    for (let c = r + 1; c < n; c++) sum -= M[r][c] * sol[c];
    sol[r] = sum / M[r][r];
  }
  return sol;
}

function runNewtonRaphson(Y, busTypes, Pspec, Qspec, V0, theta0, tol = 1e-6, maxIter = 30) {
  const n = busTypes.length;
  const V = V0.slice(), theta = theta0.slice();
  const pvIdx = [], pqIdx = [];
  busTypes.forEach((t, i) => { if (t === "PV") pvIdx.push(i); if (t === "PQ") pqIdx.push(i); });
  const pvPqIdx = [...pvIdx, ...pqIdx].sort((a, b) => a - b);

  let converged = false, iterations = 0;
  for (let it = 1; it <= maxIter; it++) {
    iterations = it;
    const { P, Q } = calcPowerInjections(V, theta, Y);
    const dP = pvPqIdx.map((i) => Pspec[i] - P[i]);
    const dQ = pqIdx.map((i) => Qspec[i] - Q[i]);
    const mismatch = [...dP, ...dQ];
    const maxMis = mismatch.length ? Math.max(...mismatch.map(Math.abs)) : 0;
    if (maxMis < tol) { converged = true; break; }
    const J = buildJacobian(V, theta, Y, pvPqIdx, pqIdx);
    const dx = gaussSolve(J, mismatch);
    const dtheta = dx.slice(0, pvPqIdx.length);
    const dV = dx.slice(pvPqIdx.length);
    pvPqIdx.forEach((i, a) => (theta[i] += dtheta[a]));
    pqIdx.forEach((i, a) => (V[i] += dV[a]));
  }
  return { converged, iterations, V, theta };
}

function branchFlows(V, theta, branches, idxOf, Sbase) {
  return branches.map((br) => {
    const z = cx(br.r, br.x);
    const y = cdiv(cx(1, 0), z);
    const ysh = cx(0, (br.b || 0) / 2);
    const fi = idxOf[br.from], ti = idxOf[br.to];
    const a = br.isXfmr && br.tapRatio ? br.tapRatio : 1;
    const Vf = cx(V[fi] * Math.cos(theta[fi]), V[fi] * Math.sin(theta[fi]));
    const Vt = cx(V[ti] * Math.cos(theta[ti]), V[ti] * Math.sin(theta[ti]));
    const yOverA = cdiv(y, cx(a, 0));
    const yOverA2 = cdiv(y, cx(a * a, 0));
    const Ift = cadd(csub(cmul(yOverA2, Vf), cmul(yOverA, Vt)), cmul(ysh, Vf));
    const Itf = cadd(csub(cmul(y, Vt), cmul(yOverA, Vf)), cmul(ysh, Vt));
    const Sft = cmul(Vf, cconj(Ift));
    const Stf = cmul(Vt, cconj(Itf));
    return {
      id: br.id, from: br.from, to: br.to, rating: br.rating || null,
      P_ft_MW: Sft.re * Sbase,
      S_ft_abs_MVA: cabs(Sft) * Sbase,
      loadingMVA: Math.max(cabs(Sft), cabs(Stf)) * Sbase,
      lossMW: (Sft.re + Stf.re) * Sbase,
    };
  });
}

function runGaussSeidel(Y, busTypes, Pspec, Qspec, V0complex, tol = 1e-6, maxIter = 1000, acceleration = 1.6) {
  const n = busTypes.length;
  const V = V0complex.map((v) => cx(v.re, v.im));
  const slackIdx = busTypes.findIndex((t) => t === "slack");
  const pvIdx = []; busTypes.forEach((t, i) => { if (t === "PV") pvIdx.push(i); });
  const vMagSet = V.map((v) => cabs(v));
  let converged = false, it = 0;
  for (it = 1; it <= maxIter; it++) {
    const Vprev = V.map((v) => cx(v.re, v.im));
    for (let i = 0; i < n; i++) {
      if (i === slackIdx) continue;
      let Si;
      if (pvIdx.includes(i)) {
        let sum = cx(0, 0);
        for (let k = 0; k < n; k++) sum = cadd(sum, cmul(Y[i][k], V[k]));
        const q_i = -cmul(cconj(V[i]), sum).im;
        Si = cx(Pspec[i], q_i);
      } else {
        Si = cx(Pspec[i], Qspec[i]);
      }
      let sumYV = cx(0, 0);
      for (let k = 0; k < n; k++) { if (k === i) continue; sumYV = cadd(sumYV, cmul(Y[i][k], V[k])); }
      const Vnew = cdiv(csub(cdiv(cconj(Si), cconj(V[i])), sumYV), Y[i][i]);
      const delta = csub(Vnew, V[i]);
      V[i] = cadd(V[i], cx(acceleration * delta.re, acceleration * delta.im));
      if (pvIdx.includes(i)) {
        const mag = cabs(V[i]);
        V[i] = cx((vMagSet[i] * V[i].re) / mag, (vMagSet[i] * V[i].im) / mag);
      }
    }
    let maxChange = 0;
    for (let i = 0; i < n; i++) { const d = cabs(csub(V[i], Vprev[i])); if (d > maxChange) maxChange = d; }
    if (maxChange < tol) { converged = true; break; }
  }
  return { converged, iterations: it, V: V.map((v) => cabs(v)), theta: V.map((v) => cangle(v)) };
}

function complexInverse(A) {
  const n = A.length;
  const M = A.map((row, i) => [...row.map((v) => cx(v.re, v.im)), ...Array.from({ length: n }, (_, j) => cx(i === j ? 1 : 0, 0))]);
  for (let col = 0; col < n; col++) {
    let maxRow = col, maxVal = cabs(M[col][col]);
    for (let r = col + 1; r < n; r++) { const v = cabs(M[r][col]); if (v > maxVal) { maxVal = v; maxRow = r; } }
    if (maxVal < 1e-13) throw new Error("singular");
    if (maxRow !== col) [M[col], M[maxRow]] = [M[maxRow], M[col]];
    const piv = M[col][col];
    for (let c = 0; c < 2 * n; c++) M[col][c] = cdiv(M[col][c], piv);
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      if (cabs(factor) < 1e-15) continue;
      for (let c = 0; c < 2 * n; c++) M[r][c] = csub(M[r][c], cmul(factor, M[col][c]));
    }
  }
  return M.map((row) => row.slice(n));
}

function threePhaseFault(Ybus, Vprefault, k, Zf = 0) {
  const Zbus = complexInverse(Ybus);
  const denom = cadd(Zbus[k][k], cx(Zf, 0));
  const Ifault = cdiv(Vprefault[k], denom);
  const Vduring = Vprefault.map((Vi, i) => csub(Vi, cmul(Zbus[i][k], Ifault)));
  return { Ifault, Vduring, Zkk: Zbus[k][k] };
}

function runN1Screening(buses, branches, Sbase, baseV, baseTheta) {
  const nameOf = (id) => buses.find((b) => b.id === id)?.name || String(id);
  const { idxOf } = buildYbus(buses, branches);
  const baseFlows = branchFlows(baseV, baseTheta, branches, idxOf, Sbase);
  const baseMap = {};
  baseFlows.forEach((f) => (baseMap[f.id] = f.S_ft_abs_MVA));

  const busTypes = buses.map((b) => b.type);
  const Pspec = buses.map((b) => (b.type === "slack" ? 0 : ((b.genP || 0) - (b.loadP || 0)) / Sbase));
  const Qspec = buses.map((b) => (b.type === "PQ" ? ((b.genQ || 0) - (b.loadQ || 0)) / Sbase : 0));

  return branches.map((outBr) => {
    const label = `${nameOf(outBr.from)} – ${nameOf(outBr.to)}`;
    const subset = branches.filter((b) => b.id !== outBr.id);
    const { Y } = buildYbus(buses, subset);
    const isolated = islandedBuses(buses, Y);
    const entry = {
      id: outBr.id, label, isolated: isolated.map((b) => b.name),
      converged: false, iterations: null, maxRedistPct: null,
      minV: null, maxV: null, voltageViolations: [], thermalViolations: [],
    };
    if (isolated.length) return entry;

    try {
      const { converged, iterations, V, theta } = runNewtonRaphson(Y, busTypes, Pspec, Qspec, baseV.slice(), baseTheta.slice(), 1e-6, 40);
      entry.converged = converged;
      entry.iterations = iterations;
      if (converged) {
        const flows = branchFlows(V, theta, subset, idxOf, Sbase);
        let maxRedist = 0;
        flows.forEach((f) => {
          const baseVal = baseMap[f.id];
          if (baseVal && baseVal > 1.0) {
            const pct = (100 * (f.S_ft_abs_MVA - baseVal)) / baseVal;
            if (Math.abs(pct) > Math.abs(maxRedist)) maxRedist = pct;
          }
          if (f.rating && f.loadingMVA > f.rating) {
            entry.thermalViolations.push({ branch: `${nameOf(f.from)}–${nameOf(f.to)}`, loadingMVA: f.loadingMVA, rating: f.rating });
          }
        });
        entry.maxRedistPct = maxRedist;
        entry.minV = Math.min(...V);
        entry.maxV = Math.max(...V);
        buses.forEach((b, i) => { if (V[i] < 0.95 || V[i] > 1.05) entry.voltageViolations.push({ bus: b.name, v: V[i] }); });
      }
    } catch (e) { /* singular Jacobian, leave converged:false */ }
    return entry;
  });
}

const STARTER_BUSES = [
  { id: 1, name: "Bus 1", x: 150, y: 260, type: "slack", vSet: 1.04, genP: 0, genQ: 0, loadP: 0, loadQ: 0 },
  { id: 2, name: "Bus 2", x: 460, y: 120, type: "PV", vSet: 1.02, genP: 60, genQ: 0, loadP: 0, loadQ: 0 },
  { id: 3, name: "Bus 3", x: 460, y: 400, type: "PQ", vSet: 1.0, genP: 0, genQ: 0, loadP: 55, loadQ: 18 },
];
const STARTER_BRANCHES = [
  { id: 101, from: 1, to: 2, r: 0.01, x: 0.06, b: 0.02, rating: 90, isXfmr: true, tapRatio: 1.0 },
  { id: 102, from: 1, to: 3, r: 0.012, x: 0.07, b: 0.02, rating: 90, isXfmr: false, tapRatio: 1.0 },
  { id: 103, from: 2, to: 3, r: 0.015, x: 0.08, b: 0.015, rating: 70, isXfmr: false, tapRatio: 1.0 },
];

const TYPE_COLOR = { slack: "var(--accent)", PV: "var(--accent2)", PQ: "var(--text-dim)" };
const TABS = [
  { id: "results", label: "Results", Icon: Activity },
  { id: "n1", label: "N-1", Icon: AlertTriangle },
  { id: "fault", label: "Fault", Icon: Radio },
  { id: "compare", label: "Compare", Icon: GitCompare },
];

function NetworkBuilder() {
  const [buses, setBuses] = useState(STARTER_BUSES);
  const [branches, setBranches] = useState(STARTER_BRANCHES);
  const [mode, setMode] = useState("select");
  const [selected, setSelected] = useState(null);
  const [branchStart, setBranchStart] = useState(null);
  const [Sbase, setSbase] = useState(100);
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("results");
  const [n1Result, setN1Result] = useState(null);
  const [faultBusId, setFaultBusId] = useState(null);
  const [faultZf, setFaultZf] = useState(0);
  const [faultResult, setFaultResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [dragId, setDragId] = useState(null);
  const nextBusId = useRef(STARTER_BUSES.length + 1);
  const nextBranchId = useRef(Math.max(...STARTER_BRANCHES.map((b) => b.id)) + 1);
  const svgRef = useRef(null);

  const getPoint = useCallback((evt) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const loc = pt.matrixTransform(ctm.inverse());
    return { x: loc.x, y: loc.y };
  }, []);

  const busById = (id) => buses.find((b) => b.id === id);

  const resetDerived = () => { setN1Result(null); setFaultResult(null); setCompareResult(null); };

  const addBus = (pt) => {
    const id = nextBusId.current++;
    setBuses((bs) => [...bs, { id, name: `Bus ${id}`, x: pt.x, y: pt.y, type: "PQ", vSet: 1.0, genP: 0, genQ: 0, loadP: 0, loadQ: 0 }]);
    setSelected({ kind: "bus", id });
    setResult(null); resetDerived();
  };

  const onCanvasClick = (evt) => {
    if (mode === "addBus") return addBus(getPoint(evt));
    if (mode === "select") setSelected(null);
  };

  const removeBus = (id) => {
    setBuses((bs) => bs.filter((b) => b.id !== id));
    setBranches((brs) => brs.filter((br) => br.from !== id && br.to !== id));
    setSelected(null); setResult(null); resetDerived();
  };
  const removeBranch = (id) => {
    setBranches((brs) => brs.filter((b) => b.id !== id));
    setSelected(null); setResult(null); resetDerived();
  };

  const onBusClick = (evt, id) => {
    evt.stopPropagation();
    if (mode === "delete") return removeBus(id);
    if (mode === "addBranch") {
      if (branchStart == null) return setBranchStart(id);
      if (branchStart === id) return setBranchStart(null);
      const bid = nextBranchId.current++;
      setBranches((brs) => [...brs, { id: bid, from: branchStart, to: id, r: 0.01, x: 0.06, b: 0.02, rating: 100, isXfmr: false, tapRatio: 1.0 }]);
      setBranchStart(null);
      setSelected({ kind: "branch", id: bid });
      setResult(null); resetDerived();
      return;
    }
    setSelected({ kind: "bus", id });
  };

  const onBusPointerDown = (evt, id) => {
    if (mode !== "select") return;
    evt.stopPropagation();
    setSelected({ kind: "bus", id });
    setDragId(id);
  };
  const onSvgPointerMove = (evt) => {
    if (dragId == null) return;
    const pt = getPoint(evt);
    setBuses((bs) => bs.map((b) => (b.id === dragId ? { ...b, x: pt.x, y: pt.y } : b)));
  };
  const onSvgPointerUp = () => setDragId(null);

  const onBranchClick = (evt, id) => {
    evt.stopPropagation();
    if (mode === "delete") return removeBranch(id);
    setSelected({ kind: "branch", id });
  };

  const updateBus = (id, patch) => { setBuses((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b))); setResult(null); resetDerived(); };
  const updateBranch = (id, patch) => { setBranches((brs) => brs.map((b) => (b.id === id ? { ...b, ...patch } : b))); setResult(null); resetDerived(); };

  const clearAll = () => { setBuses([]); setBranches([]); setSelected(null); setResult(null); setBranchStart(null); resetDerived(); };
  const loadExample = () => { setBuses(STARTER_BUSES); setBranches(STARTER_BRANCHES); setSelected(null); setResult(null); resetDerived(); nextBusId.current = STARTER_BUSES.length + 1; nextBranchId.current = Math.max(...STARTER_BRANCHES.map((b) => b.id)) + 1; };

  const solve = () => {
    resetDerived();
    const slackCount = buses.filter((b) => b.type === "slack").length;
    if (buses.length === 0) return setResult({ error: "Add at least one bus first." });
    if (slackCount !== 1) return setResult({ error: `Need exactly one slack bus (found ${slackCount}).` });

    const { Y, idxOf } = buildYbus(buses, branches);
    const isolated = islandedBuses(buses, Y);
    if (isolated.length) return setResult({ error: `${isolated.map((b) => b.name).join(", ")} ${isolated.length > 1 ? "are" : "is"} not connected to any branch.` });

    const busTypes = buses.map((b) => b.type);
    const Pspec = buses.map((b) => (b.type === "slack" ? 0 : ((b.genP || 0) - (b.loadP || 0)) / Sbase));
    const Qspec = buses.map((b) => (b.type === "PQ" ? ((b.genQ || 0) - (b.loadQ || 0)) / Sbase : 0));
    const V0 = buses.map((b) => (b.type === "PQ" ? 1.0 : b.vSet || 1.0));
    const theta0 = buses.map(() => 0);

    try {
      const { converged, iterations, V, theta } = runNewtonRaphson(Y, busTypes, Pspec, Qspec, V0, theta0);
      const { P, Q } = calcPowerInjections(V, theta, Y);
      const byBus = {};
      buses.forEach((b, i) => (byBus[b.id] = { V: V[i], theta: theta[i], P: P[i] * Sbase, Q: Q[i] * Sbase }));
      const flows = branchFlows(V, theta, branches, idxOf, Sbase);
      setResult({ converged, iterations, V, theta, byBus, flows });
      if (!faultBusId && buses.length) setFaultBusId(buses[0].id);
    } catch (e) {
      setResult({ error: "The Jacobian was singular: check the network for very weak or duplicate branches." });
    }
  };

  const runN1 = () => {
    if (!result?.converged) return;
    setN1Result(runN1Screening(buses, branches, Sbase, result.V, result.theta));
  };

  const runFault = () => {
    if (!result?.converged || faultBusId == null) return;
    const { Y, idxOf } = buildYbus(buses, branches);
    const k = idxOf[faultBusId];
    const Vpre = buses.map((b, i) => cx(result.V[i] * Math.cos(result.theta[i]), result.V[i] * Math.sin(result.theta[i])));
    try {
      const { Ifault, Vduring } = threePhaseFault(Y, Vpre, k, faultZf);
      setFaultResult({
        IfaultPu: cabs(Ifault), IfaultAngleDeg: (cangle(Ifault) * 180) / Math.PI,
        table: buses.map((b, i) => ({ name: b.name, v: cabs(Vduring[i]) })),
      });
    } catch (e) { setFaultResult({ error: "Ybus is singular for this network." }); }
  };

  const runCompare = () => {
    if (!result?.converged) return;
    const { Y } = buildYbus(buses, branches);
    const busTypes = buses.map((b) => b.type);
    const Pspec = buses.map((b) => (b.type === "slack" ? 0 : ((b.genP || 0) - (b.loadP || 0)) / Sbase));
    const Qspec = buses.map((b) => (b.type === "PQ" ? ((b.genQ || 0) - (b.loadQ || 0)) / Sbase : 0));
    const V0c = buses.map((b) => cx(b.type === "PQ" ? 1.0 : b.vSet || 1.0, 0));
    const gs = runGaussSeidel(Y, busTypes, Pspec, Qspec, V0c);
    const maxDevPct = Math.max(...buses.map((b, i) => (100 * Math.abs(gs.V[i] - result.V[i])) / result.V[i]));
    setCompareResult({
      converged: gs.converged, iterations: gs.iterations, maxDevPct,
      table: buses.map((b, i) => ({ name: b.name, vNR: result.V[i], vGS: gs.V[i] })),
    });
  };

  const selBus = selected?.kind === "bus" ? busById(selected.id) : null;
  const selBranch = selected?.kind === "branch" ? branches.find((b) => b.id === selected.id) : null;

  const loadColor = (flow) => {
    if (!flow.rating) return "var(--accent2)";
    const pct = flow.loadingMVA / flow.rating;
    if (pct > 1) return "var(--danger)";
    if (pct > 0.7) return "var(--accent)";
    return "var(--ok)";
  };

  return (
    <div className="nwb-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .nwb-root{
          --bg:#0a121d; --panel:#0e1b29; --panel2:#0c1826;
          --grid:#152841; --line:#233850; --text:#e7edf5; --text-dim:#7d93ac;
          --accent:#e3a53f; --accent2:#4fd1c5; --danger:#e2564f; --ok:#59c98a;
          background:var(--bg); color:var(--text); font-family:'IBM Plex Mono',monospace;
          border-radius:14px; overflow:hidden; border:1px solid var(--line);
          display:flex; flex-direction:column; min-height:660px;
        }
        .nwb-head{display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1px solid var(--line); background:var(--panel2);}
        .nwb-title{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.15rem;}
        .nwb-title small{display:block; font-family:'IBM Plex Mono',monospace; font-weight:400; font-size:.72rem; color:var(--text-dim); margin-top:2px;}
        .nwb-toolbar{display:flex; align-items:center; gap:8px; padding:10px 16px; border-bottom:1px solid var(--line); background:var(--panel); flex-wrap:wrap;}
        .nwb-btn{display:inline-flex; align-items:center; gap:6px; background:transparent; color:var(--text-dim); border:1px solid var(--line); border-radius:7px; padding:7px 11px; font-size:.76rem; font-family:'IBM Plex Mono',monospace; cursor:pointer; transition:.15s;}
        .nwb-btn:hover{border-color:var(--accent2); color:var(--accent2);}
        .nwb-btn.active{background:color-mix(in srgb, var(--accent) 16%, transparent); border-color:var(--accent); color:var(--accent);}
        .nwb-btn.danger:hover{border-color:var(--danger); color:var(--danger);}
        .nwb-btn.solve{background:var(--accent2); color:#04231f; border-color:var(--accent2); font-weight:600;}
        .nwb-btn.solve:hover{filter:brightness(1.08); color:#04231f;}
        .nwb-btn:disabled{opacity:.4; cursor:not-allowed;}
        .nwb-sep{width:1px; align-self:stretch; background:var(--line); margin:0 4px;}
        .nwb-field{display:flex; align-items:center; gap:6px; font-size:.74rem; color:var(--text-dim);}
        .nwb-field input{width:64px; background:var(--panel2); border:1px solid var(--line); color:var(--text); border-radius:6px; padding:5px 7px; font-family:'IBM Plex Mono',monospace; font-size:.76rem;}
        .nwb-body{display:flex; flex:1; min-height:0;}
        .nwb-canvas-wrap{flex:1; position:relative; min-width:0;}
        .nwb-canvas{width:100%; height:100%; display:block; cursor:crosshair;}
        .nwb-canvas.mode-select{cursor:default;}
        .nwb-side{width:320px; border-left:1px solid var(--line); background:var(--panel2); overflow-y:auto; flex-shrink:0; display:flex; flex-direction:column;}
        .nwb-tabs{display:flex; border-bottom:1px solid var(--line); flex-shrink:0;}
        .nwb-tab{flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; padding:9px 4px; background:transparent; border:none; border-bottom:2px solid transparent; color:var(--text-dim); font-family:'IBM Plex Mono',monospace; font-size:.62rem; cursor:pointer;}
        .nwb-tab.active{color:var(--accent2); border-bottom-color:var(--accent2);}
        .nwb-side-inner{padding:16px; flex:1;}
        .nwb-h{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:.85rem; margin-bottom:12px; color:var(--text);}
        .nwb-h-row{display:flex; align-items:center; justify-content:space-between; gap:8px;}
        .nwb-closebtn{background:transparent; border:1px solid var(--line); border-radius:6px; color:var(--text-dim); width:22px; height:22px; line-height:1; font-size:.95rem; cursor:pointer; flex-shrink:0;}
        .nwb-closebtn:hover{color:var(--text); border-color:var(--text-dim);}
        .nwb-row{display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px;}
        .nwb-row label{font-size:.72rem; color:var(--text-dim); flex-shrink:0;}
        .nwb-row input, .nwb-row select{background:var(--bg); border:1px solid var(--line); color:var(--text); border-radius:6px; padding:6px 8px; font-family:'IBM Plex Mono',monospace; font-size:.78rem; width:130px;}
        .nwb-check{display:flex; align-items:center; gap:8px; margin-bottom:12px; font-size:.74rem; color:var(--text-dim);}
        .nwb-hint{font-size:.68rem; color:var(--text-dim); line-height:1.5; margin-bottom:14px;}
        .nwb-empty{padding:14px; border:1px dashed var(--line); border-radius:8px; font-size:.72rem; color:var(--text-dim); line-height:1.6;}
        .nwb-status{display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:8px; font-size:.76rem; margin-bottom:14px;}
        .nwb-status.ok{background:color-mix(in srgb, var(--ok) 12%, transparent); color:var(--ok); border:1px solid color-mix(in srgb, var(--ok) 40%, transparent);}
        .nwb-status.err{background:color-mix(in srgb, var(--danger) 12%, transparent); color:var(--danger); border:1px solid color-mix(in srgb, var(--danger) 40%, transparent);}
        .nwb-table{width:100%; border-collapse:collapse; font-size:.71rem; margin-bottom:16px;}
        .nwb-table th{text-align:left; color:var(--text-dim); font-weight:500; padding:4px 6px; border-bottom:1px solid var(--line);}
        .nwb-table td{padding:5px 6px; border-bottom:1px solid color-mix(in srgb, var(--line) 60%, transparent);}
        .nwb-legend{display:flex; gap:14px; flex-wrap:wrap; padding:8px 16px; font-size:.68rem; color:var(--text-dim); border-top:1px solid var(--line); background:var(--panel);}
        .nwb-legend span{display:inline-flex; align-items:center; gap:5px;}
        .nwb-dot{width:9px; height:9px; border-radius:50%; display:inline-block;}
        @keyframes nwbflow{to{stroke-dashoffset:-24;}}
        .nwb-delbtn{margin-top:6px; width:100%; justify-content:center;}
        .nwb-runbtn{width:100%; justify-content:center; margin-bottom:14px;}
      `}</style>

      <div className="nwb-head">
        <div className="nwb-title">Network Builder<small>Place buses, draw branches, solve the load flow</small></div>
        <div className="nwb-field"><Zap size={13} /><span>Base</span>
          <input type="number" value={Sbase} onChange={(e) => { setSbase(Number(e.target.value) || 100); setResult(null); resetDerived(); }} />
          <span>MVA</span>
        </div>
      </div>

      <div className="nwb-toolbar">
        <button className={`nwb-btn ${mode === "select" ? "active" : ""}`} onClick={() => { setMode("select"); setBranchStart(null); }}><MousePointer2 size={14} /> Select</button>
        <button className={`nwb-btn ${mode === "addBus" ? "active" : ""}`} onClick={() => { setMode("addBus"); setBranchStart(null); }}><CirclePlus size={14} /> Add bus</button>
        <button className={`nwb-btn ${mode === "addBranch" ? "active" : ""}`} onClick={() => { setMode("addBranch"); setBranchStart(null); }}><Cable size={14} /> Add branch</button>
        <button className={`nwb-btn danger ${mode === "delete" ? "active" : ""}`} onClick={() => { setMode("delete"); setBranchStart(null); }}><Trash2 size={14} /> Delete</button>
        <div className="nwb-sep" />
        <button className="nwb-btn" onClick={loadExample}><RotateCcw size={14} /> Example</button>
        <button className="nwb-btn danger" onClick={clearAll}>Clear all</button>
        <div style={{ flex: 1 }} />
        <button className="nwb-btn solve" onClick={solve}><Play size={14} /> Solve</button>
      </div>

      <div className="nwb-body">
        <div className="nwb-canvas-wrap">
          <svg ref={svgRef} className={`nwb-canvas mode-${mode}`} viewBox="0 0 640 480" onClick={onCanvasClick} onPointerMove={onSvgPointerMove} onPointerUp={onSvgPointerUp}>
            <defs>
              <pattern id="nwbgrid" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0H0V28" fill="none" stroke="var(--grid)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="640" height="480" fill="url(#nwbgrid)" />

            {branches.map((br) => {
              const f = busById(br.from), t = busById(br.to);
              if (!f || !t) return null;
              const flow = result?.flows?.find((fl) => fl.id === br.id);
              const isSel = selected?.kind === "branch" && selected.id === br.id;
              const forward = flow ? flow.P_ft_MW >= 0 : true;
              const [ax, ay, bx, by] = forward ? [f.x, f.y, t.x, t.y] : [t.x, t.y, f.x, f.y];
              const color = flow ? loadColor(flow) : "var(--line)";
              const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
              return (
                <g key={br.id} onClick={(e) => onBranchClick(e, br.id)} style={{ cursor: "pointer" }}>
                  <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke="transparent" strokeWidth={14} />
                  <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={isSel ? "var(--accent2)" : color} strokeWidth={isSel ? 3 : 2} strokeDasharray={br.isXfmr ? "5 4" : "none"} />
                  {br.isXfmr && <circle cx={mx} cy={my} r={7} fill="var(--bg)" stroke={color} strokeWidth={1.6} />}
                  {flow && (
                    <line x1={ax} y1={ay} x2={bx} y2={by} stroke={color} strokeWidth={2} strokeDasharray="6 10"
                      style={{ animation: `nwbflow ${Math.max(0.5, 1.4 - flow.loadingMVA / (flow.rating || 150))}s linear infinite` }} />
                  )}
                </g>
              );
            })}

            {mode === "addBranch" && branchStart != null && (() => {
              const s = busById(branchStart);
              return s ? <circle cx={s.x} cy={s.y} r={16} fill="none" stroke="var(--accent2)" strokeWidth={2} strokeDasharray="3 4" /> : null;
            })()}

            {buses.map((b) => {
              const r = result?.byBus?.[b.id];
              const isSel = selected?.kind === "bus" && selected.id === b.id;
              const vOut = r && (r.V < 0.95 || r.V > 1.05);
              return (
                <g key={b.id} onPointerDown={(e) => onBusPointerDown(e, b.id)} onClick={(e) => onBusClick(e, b.id)} style={{ cursor: mode === "select" ? "grab" : "pointer" }}>
                  <circle cx={b.x} cy={b.y} r={13} fill="var(--bg)" stroke={vOut ? "var(--danger)" : isSel ? "var(--accent2)" : TYPE_COLOR[b.type]} strokeWidth={isSel ? 3 : 2.2} />
                  <circle cx={b.x} cy={b.y} r={4} fill={TYPE_COLOR[b.type]} />
                  <text x={b.x} y={b.y - 20} textAnchor="middle" fontSize="11" fill="var(--text)" fontFamily="'IBM Plex Mono',monospace">{b.name}</text>
                  {r && <text x={b.x} y={b.y + 30} textAnchor="middle" fontSize="10" fill={vOut ? "var(--danger)" : "var(--text-dim)"} fontFamily="'IBM Plex Mono',monospace">{r.V.toFixed(3)}∠{((r.theta * 180) / Math.PI).toFixed(1)}°</text>}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="nwb-side">
          <div className="nwb-tabs">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`nwb-tab ${tab === id && !selBus && !selBranch ? "active" : ""}`}
                onClick={() => { setTab(id); setSelected(null); }}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          <div className="nwb-side-inner">
            {selBus && (
              <>
                <div className="nwb-h nwb-h-row">
                  <span>{selBus.name}</span>
                  <button className="nwb-closebtn" title="Close (back to results)" onClick={() => setSelected(null)}>&times;</button>
                </div>
                <div className="nwb-row"><label>Name</label><input value={selBus.name} onChange={(e) => updateBus(selBus.id, { name: e.target.value })} /></div>
                <div className="nwb-row"><label>Type</label>
                  <select value={selBus.type} onChange={(e) => updateBus(selBus.id, { type: e.target.value })}>
                    <option value="slack">Slack</option><option value="PV">PV</option><option value="PQ">PQ</option>
                  </select>
                </div>
                {(selBus.type === "slack" || selBus.type === "PV") && (
                  <div className="nwb-row"><label>V set (pu)</label><input type="number" step="0.01" value={selBus.vSet} onChange={(e) => updateBus(selBus.id, { vSet: Number(e.target.value) })} /></div>
                )}
                {selBus.type !== "slack" && (
                  <div className="nwb-row"><label>Generation P (MW)</label><input type="number" value={selBus.genP} onChange={(e) => updateBus(selBus.id, { genP: Number(e.target.value) })} /></div>
                )}
                {selBus.type === "PQ" && (
                  <div className="nwb-row"><label>Generation Q (MVAR)</label><input type="number" value={selBus.genQ} onChange={(e) => updateBus(selBus.id, { genQ: Number(e.target.value) })} /></div>
                )}
                {selBus.type !== "slack" && (
                  <>
                    <div className="nwb-row"><label>Load P (MW)</label><input type="number" value={selBus.loadP} onChange={(e) => updateBus(selBus.id, { loadP: Number(e.target.value) })} /></div>
                    <div className="nwb-row"><label>Load Q (MVAR)</label><input type="number" value={selBus.loadQ} onChange={(e) => updateBus(selBus.id, { loadQ: Number(e.target.value) })} /></div>
                  </>
                )}
                <div className="nwb-hint">
                  {selBus.type === "PV" ? "Q output is solved for; load Q is only used to back it out of the net injection." : "Net injection = generation − load."}
                </div>
                <button className="nwb-btn danger nwb-delbtn" onClick={() => removeBus(selBus.id)}><Trash2 size={13} /> Remove bus</button>
              </>
            )}

            {selBranch && (() => {
              const f = busById(selBranch.from), t = busById(selBranch.to);
              return (
                <>
                  <div className="nwb-h nwb-h-row">
                    <span>Branch: {f?.name} — {t?.name}</span>
                    <button className="nwb-closebtn" title="Close (back to results)" onClick={() => setSelected(null)}>&times;</button>
                  </div>
                  <div className="nwb-row"><label>R (pu)</label><input type="number" step="0.001" value={selBranch.r} onChange={(e) => updateBranch(selBranch.id, { r: Number(e.target.value) })} /></div>
                  <div className="nwb-row"><label>X (pu)</label><input type="number" step="0.001" value={selBranch.x} onChange={(e) => updateBranch(selBranch.id, { x: Number(e.target.value) })} /></div>
                  <div className="nwb-row"><label>B (pu, total)</label><input type="number" step="0.001" value={selBranch.b} onChange={(e) => updateBranch(selBranch.id, { b: Number(e.target.value) })} /></div>
                  <div className="nwb-row"><label>Rating (MVA)</label><input type="number" value={selBranch.rating || ""} onChange={(e) => updateBranch(selBranch.id, { rating: Number(e.target.value) || null })} /></div>
                  <div className="nwb-check"><input type="checkbox" checked={!!selBranch.isXfmr} onChange={(e) => updateBranch(selBranch.id, { isXfmr: e.target.checked })} /> Transformer (dashed on diagram)</div>
                  {selBranch.isXfmr && (
                    <div className="nwb-row">
                      <label>Tap ratio</label>
                      <input type="number" step="0.01" min="0.5" max="1.5" value={selBranch.tapRatio ?? 1.0}
                        onChange={(e) => updateBranch(selBranch.id, { tapRatio: Number(e.target.value) || 1.0 })} />
                    </div>
                  )}
                  <div className="nwb-hint">Impedances are per-unit on the system base above.{selBranch.isXfmr ? " Tap ratio = 1.0 is nominal (plain series impedance); off-nominal taps (e.g. 1.05) model the transformer boosting or bucking voltage on the \"from\" side." : ""}</div>
                  <button className="nwb-btn danger nwb-delbtn" onClick={() => removeBranch(selBranch.id)}><Trash2 size={13} /> Remove branch</button>
                </>
              );
            })()}

            {!selBus && !selBranch && tab === "results" && (
              <>
                <div className="nwb-h">Load flow results</div>
                {result?.error && <div className="nwb-status err"><AlertTriangle size={14} /> {result.error}</div>}
                {result && !result.error && (
                  <div className={`nwb-status ${result.converged ? "ok" : "err"}`}>
                    {result.converged ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    {result.converged ? `Converged in ${result.iterations} iterations` : `Did not converge after ${result.iterations} iterations`}
                  </div>
                )}
                {result?.byBus && (
                  <table className="nwb-table">
                    <thead><tr><th>Bus</th><th>V (pu)</th><th>θ (°)</th></tr></thead>
                    <tbody>{buses.map((b) => { const r = result.byBus[b.id]; return (
                      <tr key={b.id}><td>{b.name}</td><td style={{ color: r.V < 0.95 || r.V > 1.05 ? "var(--danger)" : "var(--text)" }}>{r.V.toFixed(4)}</td><td>{((r.theta * 180) / Math.PI).toFixed(2)}</td></tr>
                    ); })}</tbody>
                  </table>
                )}
                {result?.flows && (
                  <table className="nwb-table">
                    <thead><tr><th>Branch</th><th>Loading</th><th>Loss (MW)</th></tr></thead>
                    <tbody>{result.flows.map((fl) => { const f = busById(fl.from), t = busById(fl.to); return (
                      <tr key={fl.id}><td>{f?.name}–{t?.name}</td><td style={{ color: loadColor(fl) }}>{fl.loadingMVA.toFixed(1)} MVA{fl.rating ? ` (${((100 * fl.loadingMVA) / fl.rating).toFixed(0)}%)` : ""}</td><td>{fl.lossMW.toFixed(2)}</td></tr>
                    ); })}</tbody>
                  </table>
                )}
                {!result && (
                  <div className="nwb-empty">
                    Select a bus or branch to edit it, or hit <b>Solve</b> to run the sample network.
                    <br /><br />
                    <b>Add bus</b> places a new PQ bus wherever you click. <b>Add branch</b> then click two buses to connect them. Drag any bus in Select mode to reposition it.
                  </div>
                )}
              </>
            )}

            {!selBus && !selBranch && tab === "n1" && (
              <>
                <div className="nwb-h">N-1 contingency screening</div>
                {!result?.converged ? (
                  <div className="nwb-empty">Solve the base case first; each branch is then tripped in turn and the network re-solved from that starting point.</div>
                ) : (
                  <>
                    <button className="nwb-btn solve nwb-runbtn" onClick={runN1}><Play size={13} /> Run N-1 screening</button>
                    {n1Result && (
                      <table className="nwb-table">
                        <thead><tr><th>Outage</th><th>Status</th><th>Max Δflow</th></tr></thead>
                        <tbody>{n1Result.map((e) => (
                          <tr key={e.id}>
                            <td>{e.label}</td>
                            <td style={{ color: e.isolated.length ? "var(--danger)" : e.converged ? (e.thermalViolations.length || e.voltageViolations.length ? "var(--accent)" : "var(--ok)") : "var(--danger)" }}>
                              {e.isolated.length ? `Islands ${e.isolated.join(", ")}` : !e.converged ? "No converge" : (e.thermalViolations.length ? `${e.thermalViolations.length} thermal` : e.voltageViolations.length ? `${e.voltageViolations.length} V viol.` : "OK")}
                            </td>
                            <td>{e.maxRedistPct != null ? `${e.maxRedistPct.toFixed(1)}%` : "—"}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    )}
                    <div className="nwb-hint">Islanded = tripping this branch isolates part of the network. Thermal = a surviving branch exceeds its MVA rating. V viol. = a bus falls outside 0.95–1.05 pu.</div>
                  </>
                )}
              </>
            )}

            {!selBus && !selBranch && tab === "fault" && (
              <>
                <div className="nwb-h">Three-phase bolted fault</div>
                {!result?.converged ? (
                  <div className="nwb-empty">Solve the base case first; the pre-fault voltages come from that solution.</div>
                ) : (
                  <>
                    <div className="nwb-row"><label>Fault bus</label>
                      <select value={faultBusId ?? ""} onChange={(e) => setFaultBusId(Number(e.target.value))}>
                        {buses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="nwb-row"><label>Zf (pu)</label><input type="number" step="0.001" value={faultZf} onChange={(e) => setFaultZf(Number(e.target.value) || 0)} /></div>
                    <button className="nwb-btn solve nwb-runbtn" onClick={runFault}><Play size={13} /> Run fault</button>
                    {faultResult?.error && <div className="nwb-status err"><AlertTriangle size={14} /> {faultResult.error}</div>}
                    {faultResult && !faultResult.error && (
                      <>
                        <div className="nwb-status ok"><CheckCircle2 size={14} /> I_fault = {faultResult.IfaultPu.toFixed(3)} pu ∠{faultResult.IfaultAngleDeg.toFixed(1)}°</div>
                        <table className="nwb-table">
                          <thead><tr><th>Bus</th><th>V during fault (pu)</th></tr></thead>
                          <tbody>{faultResult.table.map((r) => <tr key={r.name}><td>{r.name}</td><td>{r.v.toFixed(4)}</td></tr>)}</tbody>
                        </table>
                      </>
                    )}
                    <div className="nwb-hint">Zf = 0 pu is a bolted (zero-impedance) fault. Uses the same Ybus as the base case; no separate generator sub-transient reactance is modelled, matching the source script.</div>
                  </>
                )}
              </>
            )}

            {!selBus && !selBranch && tab === "compare" && (
              <>
                <div className="nwb-h">Gauss-Seidel cross-check</div>
                {!result?.converged ? (
                  <div className="nwb-empty">Solve the base case with Newton-Raphson first, then run Gauss-Seidel as an independent check.</div>
                ) : (
                  <>
                    <button className="nwb-btn solve nwb-runbtn" onClick={runCompare}><Play size={13} /> Run Gauss-Seidel</button>
                    {compareResult && (
                      <>
                        <div className={`nwb-status ${compareResult.converged ? "ok" : "err"}`}>
                          {compareResult.converged ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          {compareResult.converged ? `Converged in ${compareResult.iterations} iterations` : "Did not converge"} · max Δ {compareResult.maxDevPct.toFixed(4)}%
                        </div>
                        <table className="nwb-table">
                          <thead><tr><th>Bus</th><th>V (NR)</th><th>V (GS)</th></tr></thead>
                          <tbody>{compareResult.table.map((r) => <tr key={r.name}><td>{r.name}</td><td>{r.vNR.toFixed(4)}</td><td>{r.vGS.toFixed(4)}</td></tr>)}</tbody>
                        </table>
                      </>
                    )}
                    <div className="nwb-hint">Gauss-Seidel is slower to converge but solves the same equations a different way; close agreement is a good sign the base case is correct.</div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="nwb-legend">
        <span><span className="nwb-dot" style={{ background: "var(--accent)" }} /> Slack</span>
        <span><span className="nwb-dot" style={{ background: "var(--accent2)" }} /> PV</span>
        <span><span className="nwb-dot" style={{ background: "var(--text-dim)" }} /> PQ</span>
        <span><span className="nwb-dot" style={{ background: "var(--ok)" }} /> Loading &lt; 70%</span>
        <span><span className="nwb-dot" style={{ background: "var(--accent)" }} /> 70–100%</span>
        <span><span className="nwb-dot" style={{ background: "var(--danger)" }} /> Overloaded / V out of range</span>
      </div>
    </div>
  );
}


ReactDOM.createRoot(document.getElementById('network-builder-root')).render(<NetworkBuilder />);