/* jshint esversion: 6 */

// Object containing preset Game of Life grids.
// Each key is the name of a pattern, and its corresponding value is an object
// with the period which the pattern repeats, and its grid representation.
export let presetPatterns = {

  block: {
    description: '4x4 grid with one block.',
    period: 1,
    grid: rowsToGrid([
      '0000',
      '0110',
      '0110',
      '0000',
    ])
  },

  tub: {
    description: '5x5 grid with one tub.',
    period: 1,
    grid: rowsToGrid([
      '00000',
      '00100',
      '01010',
      '00100',
      '00000',
    ]),
  },

  blinker: {
    description: '3x3 grid with one blinker.',
    period: 2,
    grid: rowsToGrid([
      '010',
      '010',
      '010',
    ]),
  },

  fourBlinkers: {
    description: '10x10 grid with four blinkers. Each blinker is synced with ' +
      'the blinker diagonally across from it.',
    period: 2,
    grid: rowsToGrid([
      '0000000000',
      '0010000000',
      '0010001110',
      '0010000000',
      '0000000000',
      '0000000000',
      '0000000100',
      '0111000100',
      '0000000100',
      '0000000000',
    ]),
  },

  pulsar: {
    description: '17x17 grid with one pulsar.',
    period: 3,
    grid: rowsToGrid([
      '00000000000000000',
      '00000100000100000',
      '00000100000100000',
      '00000110001100000',
      '00000000000000000',
      '01110011011001110',
      '00010101010101000',
      '00000110001100000',
      '00000000000000000',
      '00000110001100000',
      '00010101010101000',
      '01110011011001110',
      '00000000000000000',
      '00000110001100000',
      '00000100000100000',
      '00000100000100000',
      '00000000000000000',
    ]),
  },

  iColumn: {
    description: '18x11 grid with one I-column.',
    period: 15,
    grid: rowsToGrid([
      '00000000000',
      '00000000000',
      '00000000000',
      '00001110000',
      '00000100000',
      '00000100000',
      '00001110000',
      '00000000000',
      '00001110000',
      '00001110000',
      '00000000000',
      '00001110000',
      '00000100000',
      '00000100000',
      '00001110000',
      '00000000000',
      '00000000000',
      '00000000000',
    ]),
  },

  glider: {
    description: '5x5 grid with one glider, which travels across the grid.',
    // TODO: How do we define period? Can't test without translating the
    // position of the glider after it completes one cycle.
    period: 0,
    grid: rowsToGrid([
      '00000',
      '00100',
      '00010',
      '01110',
      '00000',
    ]),
  },

};

/* Returns a grid created from an array of strings. */
export function rowsToGrid(rowsArray) {
  let grid = [];
  for (let rowAsString of rowsArray) {
    // Split each string into an array of individual characters,
    // then convert that into an array of numbers,
    // then add that array to the grid array.
    grid.push(rowAsString.split('').map(char => parseInt(char)));
  }
  return grid;
}

/*
 * Returns an array of arrays of zeros.
 * The outer array has length equal to given number of rows.
 * Each element of the outer array has length equal to given number of columns.
 */
export function createZerosGrid(rows, columns = rows) {
  let grid = []; // array of length rows, each element is 0
  for (let i = 0; i < rows; i++) {
    let column = Array(columns).fill(0); //  array of length columns
    grid[i] = column;
  }
  return grid;
}

/* Returns an n x m grid where each cell is randomly 1 or 0. */
export function createRandomGrid(rows, columns = rows) {
  let grid = [];

  for (let i = 0; i < rows; i++) {
    // We create an empty array for each row
    let row = [];

    // Then we add a random integer (0 or 1) for each column in that row
    for (let j = 0; j < columns; j++) {
      row.push(Math.floor(Math.random() * 2));
    }

    // Then we add that completed row to the grid
    grid.push(row);
  }

  return grid;
}