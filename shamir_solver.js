// Shamir's Secret Sharing Solver
// Complete JavaScript implementation

const fs = require('fs');

/**
 * Convert a number from any base (2-36) to decimal
 * @param {string} value - The number as a string
 * @param {number} base - The base of the number (2-36)
 * @returns {number} - The decimal representation
 */
function baseToDecimal(value, base) {
    const digits = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = 0;
    value = value.toLowerCase();
    
    for (let i = 0; i < value.length; i++) {
        const digitValue = digits.indexOf(value[i]);
        if (digitValue === -1 || digitValue >= base) {
            throw new Error(`Invalid digit '${value[i]}' for base ${base}`);
        }
        result = result * base + digitValue;
    }
    
    return result;
}

/**
 * Lagrange interpolation to find the polynomial value at x=0 (the secret)
 * @param {Array} points - Array of {x, y} coordinate objects
 * @returns {number} - The secret (constant term of polynomial)
 */
function lagrangeInterpolation(points) {
    let secret = 0;
    const n = points.length;
    
    // Calculate the constant term using Lagrange interpolation
    // P(0) = sum of (yi * Li(0)) where Li(0) is the Lagrange basis polynomial at x=0
    for (let i = 0; i < n; i++) {
        let xi = points[i].x;
        let yi = points[i].y;
        
        // Calculate the Lagrange basis polynomial Li(0)
        let li = 1;
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                let xj = points[j].x;
                // Li(0) = product of (0 - xj) / (xi - xj) for all j != i
                li *= (0 - xj) / (xi - xj);
            }
        }
        
        secret += yi * li;
    }
    
    return Math.round(secret);
}

/**
 * Main function to solve Shamir's Secret Sharing
 * @param {Object} testCase - JSON object containing the test case data
 * @returns {number} - The secret value
 */
function solveShamirSecret(testCase) {
    const keys = testCase.keys;
    const n = keys.n;
    const k = keys.k;
    
    console.log(`\nProcessing test case:`);
    console.log(`n (total roots) = ${n}`);
    console.log(`k (minimum roots needed) = ${k}`);
    console.log(`Polynomial degree = ${k - 1}`);
    
    // Extract and convert all points
    const points = [];
    
    for (let i = 1; i <= n; i++) {
        if (testCase[i.toString()]) {
            const root = testCase[i.toString()];
            const base = parseInt(root.base);
            const value = root.value;
            
            try {
                // Convert to decimal
                const decimalValue = baseToDecimal(value, base);
                points.push({ x: i, y: decimalValue });
                
                console.log(`Point ${i}: base ${base}, value "${value}" -> decimal ${decimalValue}`);
            } catch (error) {
                console.error(`Error converting point ${i}: ${error.message}`);
                continue;
            }
        }
    }
    
    console.log(`\nTotal points available: ${points.length}`);
    console.log(`Points needed for interpolation: ${k}`);
    
    if (points.length < k) {
        throw new Error(`Not enough valid points for interpolation. Need ${k}, have ${points.length}`);
    }
    
    // Use the first k points for interpolation
    const interpolationPoints = points.slice(0, k);
    
    console.log('\nUsing points for Lagrange interpolation:');
    interpolationPoints.forEach(point => {
        console.log(`(x=${point.x}, y=${point.y})`);
    });
    
    // Find the secret (constant term of polynomial)
    const secret = lagrangeInterpolation(interpolationPoints);
    
    console.log(`\n*** The secret (constant term) is: ${secret} ***`);
    
    return secret;
}

/**
 * Verify the solution by checking if all points satisfy the reconstructed polynomial
 * This is optional validation (commented out as it requires polynomial reconstruction)
 */
function verifySolution(points, secret, degree) {
    // This would require full polynomial reconstruction, which is more complex
    // For now, we trust the Lagrange interpolation result
    console.log(`\nVerification: The secret ${secret} is the constant term of a degree-${degree} polynomial`);
}

// Test Case 1
const testCase1 = {
    "keys": {
        "n": 4,
        "k": 3
    },
    "1": {
        "base": "10",
        "value": "4"
    },
    "2": {
        "base": "2",
        "value": "111"
    },
    "3": {
        "base": "10",
        "value": "12"
    },
    "6": {
        "base": "4",
        "value": "213"
    }
};

// Test Case 2
const testCase2 = {
    "keys": {
        "n": 10,
        "k": 7
    },
    "1": {
        "base": "6",
        "value": "13444211440455345511"
    },
    "2": {
        "base": "15",
        "value": "aed7015a346d635"
    },
    "3": {
        "base": "15",
        "value": "6aeeb69631c227c"
    },
    "4": {
        "base": "16",
        "value": "e1b5e05623d881f"
    },
    "5": {
        "base": "8",
        "value": "316034514573652620673"
    },
    "6": {
        "base": "3",
        "value": "2122212201122002221120200210011020220200"
    },
    "7": {
        "base": "3",
        "value": "20120221122211000100210021102001201112121"
    },
    "8": {
        "base": "6",
        "value": "20220554335330240002224253"
    },
    "9": {
        "base": "12",
        "value": "45153788322a1255483"
    },
    "10": {
        "base": "7",
        "value": "1101613130313526312514143"
    }
};

// Function to run a single test case
function runTestCase(testCase, testNumber) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`TEST CASE ${testNumber}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
        const secret = solveShamirSecret(testCase);
        return secret;
    } catch (error) {
        console.error(`Error in test case ${testNumber}: ${error.message}`);
        return null;
    }
}

// Main execution
function main() {
    console.log("Shamir's Secret Sharing Solver");
    console.log("==============================");
    
    // Run both test cases
    const secret1 = runTestCase(testCase1, 1);
    const secret2 = runTestCase(testCase2, 2);
    
    // Summary
    console.log(`\n${'='.repeat(50)}`);
    console.log("SUMMARY OF RESULTS");
    console.log(`${'='.repeat(50)}`);
    console.log(`Test Case 1 Secret: ${secret1 !== null ? secret1 : 'FAILED'}`);
    console.log(`Test Case 2 Secret: ${secret2 !== null ? secret2 : 'FAILED'}`);
}

// Alternative function to read from JSON file (if needed)
function solveFromFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const testCase = JSON.parse(data);
        console.log(`Processing test case from file: ${filename}`);
        return solveShamirSecret(testCase);
    } catch (error) {
        console.error(`Error reading file ${filename}: ${error.message}`);
        return null;
    }
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        baseToDecimal,
        lagrangeInterpolation,
        solveShamirSecret,
        runTestCase,
        solveFromFile
    };
}

// Run the main program
main();

