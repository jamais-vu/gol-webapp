/* jshint esversion: 6 */

// TODO: This is a mess right now, unit testing is on my to-do list.
// Much of my testing has been ad hoc, using the canvas drawing and debugger.
// For a more complex project, I would absolutely ensure I had valid unit tests
// before continuing to add new features, to save myself future headaches.

import * as Grid from './grid.js';
import * as Life from './life.js';
import * as Patterns from './patterns.js'; // Preset patterns for testing

/*
 * Prints to console saying whether all tests in `testAllPatterns()` passed.
 * If one or more failed, prints those specific test results to console.
 */
function checkAllTestsPass(printAllResults = false) {
  const results = testAllPatterns(); // Object containing all test results.
  let failedResults = {};            // Object which we add failed results to.
  let countOfFailedResults = 0;      // The number of failed test results.

  for (let patternName in results) {
    if (results[patternName].passes === false) {
      // If the test didn't pass, we increment the count of failed results,
      // and add the failed result to the failedResults object.
      countOfFailedResults += 1;
      failedResults[patternName] = results[patternName];
    }
  }

  // We count the number of failed results and check if it's nonzero because
  // that's easier than checking if the failedResults object has "length" of 0.
  if (countOfFailedResults != 0) {
    console.log(`Tests: ${countOfFailedResults} failed!`);
    if (printAllResults) {
      console.log(results); // Print all results, passed and failed.
    } else {
      console.log(failedResults); // Only print failed results.
    }
  } else {
    console.log('Tests: all pass!');
    if (printAllResults) console.log(results);
  }
}

/*
 * Tests that each pattern in the `presetPatterns` object repeats after a
 * number of steps equal to its period.
 * Returns a results object, with structure:
 *  results = {
 *    patternName: {passes: <true/false>, period: <pattern's period>}
 *  }
 */
function testAllPatterns(patterns = Patterns.presetPatterns) {
  let results = {};
  for (let patternName in patterns) {
    results[patternName] = {
      passes: testPattern(patterns[patternName]), // whether the test passed
      period: patterns[patternName].period,       // the pattern's period
    };
  }
  return results;
}

/*
 * Takes a pattern object `pattern = {period: ..., grid: ...}`
 * and checks that it repeats with its specified period.
 */
function testPattern(pattern, verbose = false) {
  const initialGrid = pattern.grid;
  const finalGrid = runGrid(pattern.grid, pattern.period, verbose = false);

  return Grid.equals(initialGrid, finalGrid);
}

/* Transitions the given grid through the given number of steps. */
function runGrid(grid, numberOfSteps = 20, verbose = false) {
  for (let currentStep = 0; currentStep < numberOfSteps; currentStep++) {
    // If verbose is true, print each step to console. Useful for debugging.
    if (verbose) console.log(`Step: ${currentStep}\n${gridToString(grid)}`);
    grid = Life.transitionGrid(grid);
  }
  return grid;
}

/* Test row removal functions. */
function testRemoveEmptyRows() {
  const before = Patterns.rowsToGrid([
    '00000',
    '00001',
    '10000',
    '00000',
    '00000',
    '00001',
    '00000',
    '00000',
  ]);
  const after = Patterns.rowsToGrid([
    '00001',
    '10000',
    '00000',
    '00000',
    '00001',
  ]);
  const testGrid = Grid.truncateEmptyRows(before);
  console.log('testRemoveEmptyRows');
  console.log(testGrid);
  console.log(Grid.equals(testGrid, after));
}

function testRemoveEmptyColumns() {
  const before = Patterns.rowsToGrid([
    '0000000',
    '0000000',
    '0001000',
    '0100100',
    '0000000',
    '0001000',
  ]);
  const after = Patterns.rowsToGrid([
    '0000',
    '0000',
    '0010',
    '1001',
    '0000',
    '0010',
  ]);
  const testGrid = Grid.truncateEmptyColumns(before);
  console.log('testRemoveEmptyColumns');
  console.log(testGrid);
  console.log(Grid.equals(testGrid, after));
}

// testRemoveEmptyRows();
// testRemoveEmptyColumns();
// checkAllTestsPass();

// Export checkAllTestsPass for use in main
export {
  checkAllTestsPass,
};