const fs = require('fs');

// Load JSON from file
const rawData = fs.readFileSync('shares.json');
const allData = JSON.parse(rawData);

// Helper: Convert very large value from given base string to BigInt decimal
function parseValueBigInt(base, value) {
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = 0n;
  const bigBase = BigInt(base);
  value = value.toLowerCase();

  for (let char of value) {
    const digit = BigInt(digits.indexOf(char));
    if (digit < 0n) throw new Error(`Invalid digit '${char}' for base ${base}`);
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
recoverSecret(allData.sampleData);

console.log("\n>>> SECOND TESTCASE <<<");
recoverSecret(allData.secondData);
