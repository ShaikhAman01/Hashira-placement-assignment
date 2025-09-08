// Shamir Secret Sharing - Secret Recovery using Lagrange Interpolation
// Language: JavaScript (Node.js)
// Enhanced version with additional error handling and validation

// ---------- Utility Functions ----------
function decodeShares(json) {
  const shares = [];
  for (const key in json) {
    if (key === "keys") continue;
    
    try {
      const x = parseInt(key, 10); // x-coordinate
      const base = parseInt(json[key].base, 10);
      const valueStr = json[key].value;
      
      // Validate base range
      if (base < 2 || base > 36) {
        console.warn(`Invalid base ${base} for key ${key}, skipping`);
        continue;
      }
      
      const y = parseInt(valueStr, base); // decode value from given base
      
      // Check for NaN (invalid conversion)
      if (isNaN(y)) {
        console.warn(`Failed to convert "${valueStr}" in base ${base} for key ${key}, skipping`);
        continue;
      }
      
      shares.push({ x, y });
      console.log(`Share ${x}: base ${base}, value "${valueStr}" → decimal ${y}`);
    } catch (error) {
      console.warn(`Error processing share ${key}: ${error.message}, skipping`);
    }
  }
  return shares;
}

function lagrangeInterpolationAtZero(shares, k) {
  let secret = 0;
  
  console.log(`\nPerforming Lagrange interpolation with ${k} shares:`);
  
  for (let i = 0; i < k; i++) {
    const { x: xi, y: yi } = shares[i];
    let li = 1;
    
    for (let j = 0; j < k; j++) {
      if (i !== j) {
        const { x: xj } = shares[j];
        li *= (0 - xj) / (xi - xj);
      }
    }
    
    secret += yi * li;
    console.log(`  L${i}(0) = ${li.toFixed(6)}, contribution: ${(yi * li).toFixed(6)}`);
  }
  
  return Math.round(secret);
}

function run(input, label) {
  console.log(`\n${'='.repeat(40)}`);
  console.log(`${label}`);
  console.log(`${'='.repeat(40)}`);
  
  const shares = decodeShares(input);
  const k = input.keys.k;
  const n = input.keys.n;
  
  console.log(`\nTest parameters: n=${n}, k=${k} (degree ${k-1} polynomial)`);
  console.log(`Total shares decoded: ${shares.length}`);

  if (shares.length < k) {
    console.error(`❌ Not enough shares! Need at least ${k}, got ${shares.length}`);
    return null;
  }

  const selectedShares = shares.slice(0, k);
  console.log(`\nSelected shares for interpolation:`);
  selectedShares.forEach(share => {
    console.log(`  (${share.x}, ${share.y})`);
  });
  
  const secret = lagrangeInterpolationAtZero(selectedShares, k);

  console.log(`\n🔐 Recovered Secret (constant term): ${secret}`);
  return secret;
}

// ---------- Test Case 1 ----------
const testcase1 = {
  "keys": { "n": 4, "k": 3 },
  "1": { "base": "10", "value": "4" },
  "2": { "base": "2", "value": "111" },
  "3": { "base": "10", "value": "12" },
  "6": { "base": "4", "value": "213" }
};

// ---------- Test Case 2 ----------
const testcase2 = {
  "keys": { "n": 10, "k": 7 },
  "1": { "base": "6", "value": "13444211440455345511" },
  "2": { "base": "15", "value": "aed7015a346d635" },
  "3": { "base": "15", "value": "6aeeb69631c227c" },
  "4": { "base": "16", "value": "e1b5e05623d881f" },
  "5": { "base": "8", "value": "316034514573652620673" },
  "6": { "base": "3", "value": "2122212201122002221120200210011020220200" },
  "7": { "base": "3", "value": "20120221122211000100210021102001201112121" },
  "8": { "base": "6", "value": "20220554335330240002224253" },
  "9": { "base": "12", "value": "45153788322a1255483" },
  "10": { "base": "7", "value": "1101613130313526312514143" }
};

// ---------- Main Execution ----------
function main() {
  console.log("🔒 Shamir's Secret Sharing - Secret Recovery");
  console.log("============================================");
  
  const secret1 = run(testcase1, "TEST CASE 1");
  const secret2 = run(testcase2, "TEST CASE 2");
  
  console.log(`\n${'='.repeat(40)}`);
  console.log("📋 FINAL RESULTS");
  console.log(`${'='.repeat(40)}`);
  console.log(`Test Case 1 Secret: ${secret1 !== null ? secret1 : 'FAILED'}`);
  console.log(`Test Case 2 Secret: ${secret2 !== null ? secret2 : 'FAILED'}`);

}

// Run the program
main();

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { decodeShares, lagrangeInterpolationAtZero, run };
}