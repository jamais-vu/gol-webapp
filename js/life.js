/* jshint esversion: 6 */

/* This file contains the actual Game of Life rules, implemented as functions
 * which take an Array<Array<number>> representing the cell states.
 *
 * Each inner array represents a row in the grid, and the numbers in each inner
 * array represents the state of that cell (e.g., grid[i][j] corresponds to the
 * state of the cell in row i, column j).
 *
 * Grid manipulations such as copying, resizing, etc. are in `grid.js`.
 */

/* Returns the next state of the given grid. Assumes the grid is a torus. */
function transitionTorusGrid(grid) {
  const rows = grid.length;
  const cols = grid[0].length;

  let nextGrid = [];

  for (let i = 0; i < rows; i++) {

    let nextRow = [];
    for (let j = 0; j < cols; j++) {
      // Since it's a torus, no cell is technically "on the edge". Cells with
      // such ij coords have neighbors on the other "side" of the grid.
      // We use modular arithmetic for this.
      const neighborCoords = getNeighborCoordsTorus(i, j, rows, cols);
      const countOfLiveNeighbors = countLiveCells(neighborCoords, grid);
      nextRow.push(transitionRule(grid[i][j], countOfLiveNeighbors));
    }
    nextGrid.push(nextRow);
  }

  return nextGrid;
}

/* Gets neighbor coords for cells on a toroidal grid.
 * Unlike our 2d plane grid below, we need only one neighbor function for this,
 * since being on a torus means handling the "edges" is a matter of taking the
 * modulus of neighbor coords which would otherwise be "off" the 2d grid.
 *
 * If we really wanted to optimize this, we might check if the given ij-coord
 * is on the edge of the grid, and only then apply `mod()`. But the application
 * is fast enough that we need not complicate things.
 */
function getNeighborCoordsTorus(i, j, rows, cols) {
  return [
    // The three cells in the row above.
    [mod(i - 1, rows), mod(j - 1, cols)],
    [mod(i - 1, rows), j],
    [mod(i - 1, rows), mod(j + 1, cols)],
    // The two cells in the same row, to the left and right.
    [i, mod(j - 1, cols)],
    [i, mod(j + 1, cols)],
    // The three cells in the row below.
    [mod(i + 1, rows), mod(j - 1, cols)],
    [mod(i + 1, rows), j],
    [mod(i + 1, rows), mod(j + 1, cols)]
  ];
}

/* Returns the integer b, 0 <= b < n, such that b is congruent to a mod n.
 *
 * We don't use `a % n` because that gives remainder, not congruence.
 * For example, `-1 % 5` returns `-1`, whereas `mod(-1, 5)` returns `4`.
 */
function mod(a, n) {
  return (((a % n) + n) % n);
}

/* Returns 1 (alive) or 0 (dead) based on the cell's current state and the
 * number of live neighbors it has.
 */
function transitionRule(cellState, countOfLiveNeighbors) {
  if (cellState == 1 && (countOfLiveNeighbors == 2 || countOfLiveNeighbors == 3)) {
    // If a live cell has 2 or 3 live neighbors, it stays alive.
    return 1;
  } else if (cellState == 0 && countOfLiveNeighbors == 3) {
    // If a dead cell has 3 live neighbors, it becomes alive.
    return 1;
  } else {
    // Otherwise, the cell dies.
    return 0;
  }
}

/* Returns the number of live cells in a given array of coordinates.
 *
 * This is used to count the number of live neighbors for a cell, but it can
 * count the number of live cells for any arbitrary array of cell coordinates
 * in a given grid.
 */
function countLiveCells(coords, grid) {
  let sum = 0;
  for (let coord of coords) { // `for..of` loop is much faster than `reduce()`
    sum += grid[coord[0]][coord[1]];
  }
  return sum;
}


// NOTE: THE FOLLOWING FUNCTIONS ARE NO LONGER USED.
//
// Initially we modeled the Game of Life grid as a finite 2d-plane, and had
// several neighbor coordinate functions specially-optimized for speed when
// calculating the next states. Since we've switched to using a toroidal grid,
// these are no longer used, but have been kept for historical interest.

/* Returns the next state of the given grid. */
function transitionGrid(grid) {
  const rows = grid.length;
  const columns = grid[0].length;

  // Maximum i and j values a coordinate may have while still being in the grid.
  const iMax = (rows - 1);
  const jMax = (columns - 1);

  let nextGrid = [];

  // Add the first row.
  nextGrid.push(createFirstrow(grid, jMax));

  // Constructs every row between the first and last.
  for (let i = 1; i < (rows - 1); i++) {
    let nextRow = [];

    for (let j = 0; j < columns; j++) {
      // Check if the cell (i, j) is on the "edge" of the grid.
      // We only check j because the outer for loop is defined such that this
      // will never be the first (top) or last (bottom) row.
      // If it is on the edge, we only consider neighboring cells that are on
      // the grid.
      let neighborCoords;
      if (j === 0) {
        // This coordinate is on the left edge.
        neighborCoords = getNeighborCoordsLeftCol(i);
      } else if (j === jMax) {
        // This coordinate is on the right edge.
        neighborCoords = getNeighborCoordsRightCol(i, jMax);
      } else {
        // This coordinate is not on any edge.
        neighborCoords = getNeighborCoords(i, j);
      }

      const countOfLiveNeighbors = countLiveCells(neighborCoords, grid);

      nextRow.push(transitionRule(grid[i][j], countOfLiveNeighbors));
    }

    nextGrid.push(nextRow);
  }

  // Add the last row.
  nextGrid.push(createLastRow(grid, iMax, jMax));

  return nextGrid;        // And now the entire grid is finished.
}

/* transitionGrid() helper function to create the first row of the next grid. */
function createFirstrow(grid, jMax) {
  let firstRow = [];
  for (let j = 0; j <= jMax; j++) {
    const neighborCoords = getNeighborCoordsTopRow(j, jMax);
    const countOfLiveNeighbors = countLiveCells(neighborCoords, grid);
    firstRow.push(transitionRule(grid[0][j], countOfLiveNeighbors));
  }
  return firstRow;
}

/* transitionGrid() helper function to create the last row of the next grid. */
function createLastRow(grid, iMax, jMax) {
  let lastRow = [];
  for (let j = 0; j <= jMax; j++) {
    const neighborCoords = getNeighborCoordsBottomRow(iMax, j, jMax);
    const countOfLiveNeighbors = countLiveCells(neighborCoords, grid);
    lastRow.push(transitionRule(grid[iMax][j], countOfLiveNeighbors));
  }
  return lastRow;
}

/* Why so many neighbor functions?
 *
 * The following functions are for getting cells adjacent to a given ij-coord.
 * A cell adjacent to (i, j) is called its "neighbor".
 *
 * We split the logic for calculating neighbor coords into different functions
 * for each case, which allows us to hardcode the relative neighbor coords.
 * This is an enormous performance increase over naively calculating all
 * neighbors and then filtering based on the cell's position.
 *
 * Previously, we used two for loops to generate all adjacent ij coordinates,
 * and then filtered those for valid coordinates, but it was unacceptably slow
 * for a user-interactive app. I wanted it to be fast.
 *
 * CASES:
 * The most common case is where a cell ij has neighbors in every direction, but
 * since the grid has edges, we need to account for the case where a cell ij is
 * in the first or last row or column. In those cases, we must not include
 * coordinates which are not in the grid ("invalid neighbors").
 *
 * The cases we need to consider:
 * - Cell is in the "middle" of the grid. It is not in the top/bottom row, nor
 *   the left/right column. This is by far the most common case.
 * - Cell is in the top or bottom row.
 * - Cell is in the left or right column.
 * - Cell is in both the top/bottom row and the left/right column.
 *
 *
 * For clarity, each function doc has a diagram showing the cell and neighbors.
 */

/* Gets valid neighbors for a cell at (i, j) which is NOT on the grid edge.
 *
 * All cells adjacent to (i, j) are on the grid:
 *
 *     Col: j-1  j  j+1
 *   Row    ___ ___ ___
 *   i-1   |___|___|___|
 *   i     |___|i,j|___|
 *   i+1   |___|___|___|
 */
function getNeighborCoords(i, j) {
  return [
    [i - 1, j - 1], // The three cells in the row above.
    [i - 1, j],
    [i - 1, j + 1],
    [i, j - 1],     // The two cells in the same row, to the left and right.
    [i, j + 1],
    [i + 1, j - 1], // The three cells in the row below.
    [i + 1, j],
    [i + 1, j + 1]
  ];
}

/* Gets valid neighbors for a cell at row 0, column j.
 *
 * Cells adjacent to (0, 0), the top-left corner on the grid:
 *     Col:  0   1
 *   Row    ___ ___
 *   0     |0,0|___|
 *   1     |___|___|
 *
 * Cells adjacent to (0, jMax), the top-right corner on the grid:
 *     Col: jMax-1  jMax
 *   Row    ______ ______
 *   0     |______|0,jMax|
 *   1     |______|______|
 *
 * Cells adjacent to (0, j), where j is not 0 or jMax:
 *     Col: j-1  j  j+1
 *   Row    ___ ___ ___
 *   0     |___|0,j|___|
 *   1     |___|___|___|
 */
function getNeighborCoordsTopRow(j, jMax) {
  let neighborCoords;
  // Is top-left of grid
  if (j === 0) {
    neighborCoords = [
      [0, j + 1],     // The cell to the right.
      [0 + 1, j],     // The cell directly below.
      [0 + 1, j + 1]  // The cell below-right.
    ];
  // Is top-right of grid
  } else if (j === jMax) {
    neighborCoords = [
      [0, j - 1],     // The cell to the left.
      [1, j],     // The cell directly below.
      [1, j - 1]  // The cell below-left.
    ];
  // Is just in top row but not top-left or top-right
  } else {
    neighborCoords = [
      [0, j - 1],     // The two cells in the same row, to the left and right.
      [0, j + 1],
      [1, j - 1], // The three cells in the row below.
      [1, j],
      [1, j + 1]
    ];
  }
  return neighborCoords;
}

/* Gets valid neighbors for a cell at (i, j), where i is the last row.
 *
 * Cells adjacent to (i, 0), the bottom-left corner on the grid:
 *     Col:  0   1
 *   Row    ___ ___
 *   i-1   |___|___|
 *   i     |i,0|___|
 *
 * Cells adjacent to (i, jMax), the bottom-right corner on the grid:
 *     Col: jMax-1  jMax
 *   Row    ______ ______
 *   i-1   |______|______|
 *   i     |______|i,jMax|
 *
 * Cells adjacent to (0, j), where j is not 0 or jMax:
 *     Col: j-1  j  j+1
 *   Row    ___ ___ ___
 *   i-1   |___|___|___|
 *   i     |___|i,j|___|
 */
function getNeighborCoordsBottomRow(i, j, jMax) {
  let neighborCoords;
  // Is bottom-left of grid
  if (j === 0) {
    neighborCoords = [
      [i, j + 1],     // The cell to the right.
      [i - 1, j],     // The cell directly above.
      [i - 1, j + 1]  // The cell above-right.
    ];
  // Is bottom-right of grid
  } else if (j === jMax) {
    neighborCoords = [
      [i, j - 1],     // The cell to the left.
      [i - 1, j],     // The cell directly above.
      [i - 1, j - 1]  // The cell aove-left.
    ];
  // Is just in bottom row but not bottom-left or bottom-right
  } else {
    neighborCoords = [
      [i, j - 1],     // The two cells in the same row, to the left and right.
      [i, j + 1],
      [i - 1, j - 1], // The three cells in the row above.
      [i - 1, j],
      [i - 1, j + 1]
    ];
  }
  return neighborCoords;
}

/* Gets valid neighbors for a cell at (i, 0), not in the top or bottom row.
 *
 * Cells adjacent to (i, j) on the grid:
 *
 *     Col:  0   1
 *   Row    ___ ___
 *   i-1   |___|___|
 *   i     |i,0|___|
 *   i+1   |___|___|
 */
function getNeighborCoordsLeftCol(i) {
  return [
    [i - 1, 0], // The cells above and above-right.
    [i - 1, 1],
    [i, 1], // The cell to the right.
    [i + 1, 0], // The cells below and below-right.
    [i + 1, 1]
  ];
}

/* Gets valid neighbors for a cell at (i, jMax), where jMax is last column, and
 * i is not the top or bottom row.
 *
 * Cells adjacent to (i, jMax) on the grid:
 *
 *     Col: jMax-1  jMax
 *   Row    ______ ______
 *   i-1   |______|______|
 *   i     |______|i,jMax|
 *   i+1   |______|______|
 */
function getNeighborCoordsRightCol(i, jMax) {
  return [
    [i - 1, jMax - 1], // The cells above-left and directly above.
    [i - 1, jMax],
    [i, jMax - 1], // The cell to the left.
    [i + 1, jMax - 1], // The cells below-left and directly below.
    [i + 1, jMax]
  ];
}

// Export the transitionGrid function
export {
  transitionGrid,
  transitionTorusGrid,
};