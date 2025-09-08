// Shamir Secret Sharing - Secret Recovery using Lagrange Interpolation
// Language: JavaScript (Node.js)

// ---------- Hardcoded Input (change this block for other test cases) ----------
const input = {
  "keys": { "n": 4, "k": 3 },
  "1": { "base": "10", "value": "4" },
  "2": { "base": "2", "value": "111" },
  "3": { "base": "10", "value": "12" },
  "6": { "base": "4", "value": "213" }
};

// ---------- Step 1: Decode all shares ----------
function decodeShares(json) {
  const shares = [];
  for (const key in json) {
    if (key === "keys") continue;
    const x = parseInt(key, 10); // x-coordinate
    const base = parseInt(json[key].base, 10);
    const valueStr = json[key].value;
    const y = parseInt(valueStr, base); // decode value from given base
    shares.push({ x, y });
  }
  return shares;
}

// ---------- Step 2: Lagrange Interpolation at x=0 ----------
function lagrangeInterpolationAtZero(shares, k) {
  let secret = 0;

  for (let i = 0; i < k; i++) {
    const { x: xi, y: yi } = shares[i];

    let li = 1; // basis polynomial coefficient at x=0
    for (let j = 0; j < k; j++) {
      if (i !== j) {
        const { x: xj } = shares[j];
        li *= (0 - xj) / (xi - xj);
      }
    }

    secret += yi * li;
  }

  return Math.round(secret); // fix floating-point errors
}

// ---------- Step 3: Run ----------
function run(input) {
  const shares = decodeShares(input);
  const k = input.keys.k;

  if (shares.length < k) {
    console.error(`Not enough shares! Need at least ${k}`);
    return;
  }

  // Pick first k shares (any k shares are valid)
  const selectedShares = shares.slice(0, k);

  const secret = lagrangeInterpolationAtZero(selectedShares, k);

  console.log("Decoded Shares:", shares);
  console.log("Using first", k, "shares:", selectedShares);
  console.log("Recovered Secret (c):", secret);
}

// Run program
run(input);
