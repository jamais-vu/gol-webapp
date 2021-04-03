/* jshint esversion: 6 */

import { copyGrid } from './copyGrid.js';

/* Functions for centering a given grid within a blank grid of greater size. */

/* Centers the given grid within a larger grid, maintaining the cell states. */
export function centerGrid(grid, newRowCount, newColumnCount = newRowCount) {
  const rowDifference = newRowCount - grid.length;
  const colDifference = newColumnCount - grid[0].length;

  // If the rowDifference or colDifference is odd, then the use of Math.floor()
  // and Math.ceil() here ensure the one "leftover" row or column is added to
  // the end of the grid.
  const rowsToStart = Math.max( Math.floor(rowDifference / 2), 0 );
  const colsToStart = Math.max( Math.floor(colDifference/ 2), 0 );

  const rowsToEnd = Math.max( Math.ceil(rowDifference / 2), 0) ;
  const colsToEnd = Math.max( Math.ceil(colDifference / 2), 0 );

  const newGrid = addToEnd(grid, rowsToEnd, colsToEnd);
  const finalGrid = addToStart(newGrid, rowsToStart, colsToStart);

  return finalGrid;
}

/* Adds the given number of blank rows and columns to the end of the grid. */
function addToEnd(grid, rowsToAdd, colsToAdd) {
  return addColumnsToEnd(addRowsToEnd(grid, rowsToAdd), colsToAdd);
}

/* Adds the given number of blank rows and columns to the start of the grid. */
function addToStart(grid, rowsToAdd, colsToAdd) {
  return addColumnsToStart(addRowsToStart(grid, rowsToAdd), colsToAdd);
}

/* Adds the given number of zero-filled columns to the right of grid.
 * This is the same as adding that number of zeros to the end of each row.
 */
function addColumnsToEnd(grid, colsToAdd) {
  let newGrid = [];
  const zeros = Array(colsToAdd).fill(0);
  for (let row of grid) {
    newGrid.push(row.concat(zeros)); // Only difference from addColumnsToStart()
  }
  return newGrid;
}

/* Adds the given number of zero-filled rows to the bottom of the grid.
 * This is the same as adding that number of zeros to the end of each column.
 */
function addRowsToEnd(grid, rowsToAdd) {
  let newGrid = copyGrid(grid);
  const numColumns = grid[0].length;
  for (let i = 1; i <= rowsToAdd; i++) {
    newGrid.push(Array(numColumns).fill(0)); // Only difference from addRowsToStart()
  }
  return newGrid;
}

/* Adds the given number of zero-filled columns to the left of the grid.
 * This is the same as adding that number of zeros to the start of each row.
 */
function addColumnsToStart(grid, colsToAdd) {
  let newGrid = [];
  const zeros = Array(colsToAdd).fill(0);
  for (let row of grid) {
    newGrid.push(zeros.concat(row)); // Only difference from addColumnsToEnd()
  }
  return newGrid;
}

/* Adds the given number of zero-filled rows to the top of the grid.
 * This is the same as adding that number of of zeros to the start of each column.
 */
function addRowsToStart(grid, rowsToAdd) {
  let newGrid = copyGrid(grid);
  const numColumns = grid[0].length;
  for (let i = 1; i <= rowsToAdd; i++) {
    newGrid.unshift(Array(numColumns).fill(0)); // Only difference from addRowsToEnd()
  }
  return newGrid;
}