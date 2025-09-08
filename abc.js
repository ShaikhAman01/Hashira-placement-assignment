// Helper: Convert very large value from given base string to BigInt decimal
function parseValueBigInt(base, value) {
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = 0n;
  const bigBase = BigInt(base);
  value = value.toLowerCase();

  for (let char of value) {
    const digit = BigInt(digits.indexOf(char));
    if (digit < 0n) {
      throw new Error(`Invalid digit '${char}' for base ${base}`);
    }
    result = result * bigBase + digit;
  }
  return result;
}

// Extended Euclidean Algorithm to compute modular inverse
function modInverse(a, m) {
  let m0 = m;
  let [x0, x1] = [0n, 1n];
  if (m === 1n) return 0n;

  while (a > 1n) {
    const q = a / m;
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }

  if (x1 < 0n) x1 += m0;
  return x1;
}

// Lagrange interpolation in BigInt (mod prime)
function lagrangeInterpolateBigInt(xPoints, yPoints, targetX, primeMod) {
  let total = 0n;
  const n = xPoints.length;

  for (let i = 0; i < n; i++) {
    let xi = BigInt(xPoints[i]);
    let yi = yPoints[i];
    let term = yi;

    for (let j = 0; j < n; j++) {
      if (i !== j) {
        let xj = BigInt(xPoints[j]);
        let num = (BigInt(targetX) - xj + primeMod) % primeMod;
        let den = (xi - xj + primeMod) % primeMod;
        term = (term * num % primeMod) * modInverse(den, primeMod) % primeMod;
      }
    }
    total = (total + term) % primeMod;
  }
  return total;
}

// ==============================
// Hardcoded Testcases
// ==============================

// SAMPLE TESTCASE
const sampleData = {
  keys: { n: 4, k: 3 },
  "1": { base: "10", value: "4" },
  "2": { base: "2", value: "111" },
  "3": { base: "10", value: "12" },
  "6": { base: "4", value: "213" }
};

// SECOND TESTCASE
const secondData = {
  keys: { n: 10, k: 7 },
  "1": { base: "6", value: "13444211440455345511" },
  "2": { base: "15", value: "aed7015a346d635" },
  "3": { base: "15", value: "6aeeb69631c227c" },
  "4": { base: "16", value: "e1b5e05623d881f" },
  "5": { base: "8", value: "316034514573652620673" },
  "6": { base: "3", value: "2122212201122002221120200210011020220200" },
  "7": { base: "3", value: "20120221122211000100210021102001201112121" },
  "8": { base: "6", value: "20220554335330240002224253" },
  "9": { base: "12", value: "45153788322a1255483" },
  "10": { base: "7", value: "1101613130313526312514143" }
};

// ==============================
// Main: recover secret
// ==============================
function recoverSecret(data) {
  const n = data.keys.n;
  const k = data.keys.k;

  const indices = Object.keys(data)
    .filter(key => key !== 'keys')
    .sort((a, b) => parseInt(a) - parseInt(b))
    .slice(0, k);

  const xPoints = [];
  const yPoints = [];

  indices.forEach(key => {
    const base = parseInt(data[key].base, 10);
    const value = data[key].value;
    xPoints.push(parseInt(key));
    yPoints.push(parseValueBigInt(base, value));
  });

  // Use a very large prime modulus
  const PRIME = 2n ** 521n - 1n;

  const recoveredC = lagrangeInterpolateBigInt(xPoints, yPoints, 0, PRIME);

  console.log("=================================");
  console.log("Used share indices:", xPoints);
  console.log("Decoded shares:", yPoints.map(v => v.toString()));
  console.log("Recovered secret (c):", recoveredC.toString());
  console.log("=================================");
}

// Run for both
console.log(">>> SAMPLE TESTCASE <<<");
recoverSecret(sampleData);

console.log("\n>>> SECOND TESTCASE <<<");
recoverSecret(secondData);
