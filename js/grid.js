/* jshint esversion: 6 */

import * as Patterns from './patterns.js';

// This module contains functions for manipulating grids in ways unrelated to
// the Game of Life transition rules.

/* Creates a deep copy of the given 2d array. Cannot handle deeper nesting. */
function copyGrid(grid) {
  let newGrid = [];
  for (let i = 0; i < grid.length; i ++) {
    newGrid.push(grid[i].slice());
  }
  return newGrid;
}

/*
 * Checks if two 2d arrays are equivalent.
 *
 * We consider grid0 to be equivalent to grid1 if each grid has the same values
 * of 0 and 1 at the same indices.
 */
function equals(grid0, grid1) {
  const rows = grid0.length;
  const cols = grid0[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid0[i][j] !== grid1[i][j]) {
        return false;
      }
    }
  }
  return true; // Only reach this if every element was the same
}


// Functions for using grids as strings.

/* Prints to console a string representation of the given grid. */
function printGrid(grid) {
  console.log(gridToString(grid));
}

/* Returns a string representation of the given grid. */
function gridToString(grid) {
  let gridAsString = '';

  for (let row of grid) {
    gridAsString += row.join('') + '\n';
  }

  return gridAsString;
}


// Functions for merging grids.

// TODO: This isn't working.
/* Places the child grid on the parent grid, starting at the given coords. */
function mergeGrids(parentGrid, childGrid, i0, j0) {
  const parentRows = parentGrid.length;
  const parentCols = parentGrid[0].length;

  childGrid = [[1,1,1,1,1,1,1,1,1,1,1,1]]; // TODO: this is just a test one
  const childRows = childGrid.length;
  const childCols = childGrid[0].length;

  parentGrid = resizeGridFromEnd(parentGrid, i0 + childRows, j0 + childCols);

  for (let i = 0; i < childRows; i++) {
    for (let j = 0; j < childCols; j++) {
      // TODO: This check is so we don't overwrite cells in the parent grid with
      // dead cells from the child grid, but maybe we want to?
      if (childGrid[j0 + j] === 1) {
        parentGrid[i0 + i][j0 + j] = childGrid[j0 + j];
      }
    }
  }
  return parentGrid;
}


// Functions for resizing a given grid.
//
// Note: These functions do NOT mutate the grid. They each return a new grid.

/* Centers the given grid within a larger grid, maintaining the cell states. */
function centerGrid(grid, newRowCount, newColumnCount = newRowCount) {
  const rowDifference = newRowCount - grid.length;
  const colDifference = newColumnCount - grid[0].length;

  // If the rowDifference or colDifference is odd, then the use of Math.floor()
  // and Math.ceil() here ensure the one "leftover" row or column is added to
  // the end of the grid.
  const rowsToStart = Math.max( Math.floor(rowDifference / 2), 0 );
  const colsToStart = Math.max( Math.floor(colDifference/ 2), 0 );

  const rowsToEnd = Math.max( Math.ceil(rowDifference / 2), 0) ;
  const colsToEnd = Math.max( Math.ceil(colDifference / 2), 0 );

  // We don't call resizeGridFromEnd() or resizeGridFromStart() here because
  // those take total row/column count, not just number of rows/columns to add.
  const newGrid = addToEnd(grid, rowsToEnd, colsToEnd);
  const finalGrid = addToStart(newGrid, rowsToStart, colsToStart);

  return finalGrid;
}

/*
 * Returns the given grid resized to larger dimensions, while maintaining the
 * state of the cells already in the grid. New cells have value 0 ("dead").
 * New columns and rows are add to the end (right and bottom) of the grid.
 *
 * If only one number is given, then it is assumed to be both the number of rows
 * to add and the number of columns to add.
 *
 * Will NOT resize a grid to smaller dimensions than it already has.
 */
function resizeGridFromEnd(grid, newRowCount, newColumnCount = newRowCount) {
  const rowDifference = (newRowCount - grid.length);
  const colDifference = (newColumnCount - grid[0].length);

  const rowsToAdd = Math.max(rowDifference, 0);
  const colsToAdd = Math.max(colDifference, 0);

  // Don't think the order of composition of these two functions matters,
  // since the grid we pass to extendColumns
  return addToStart(grid, rowsToAdd, colsToAdd);
}

/* Same as resizeGridFromEnd() but adds new columns/rows to start, not end. */
function resizeGridFromStart(grid, newRowCount, newColumnCount = newRowCount) {
  const rowDifference = (newRowCount - grid.length);
  const colDifference = (newColumnCount - grid[0].length);

  const rowsToAdd = Math.max(rowDifference, 0);
  const colsToAdd = Math.max(colDifference, 0);

  return addToStart(grid, rowsToAdd, colsToAdd);
}

/* Adds the given number of blank rows and columns to the end of the grid. */
function addToEnd(grid, rowsToAdd, colsToAdd) {
  return addColumnsToEnd(addRowsToEnd(grid, rowsToAdd), colsToAdd);
}

/* Adds the given number of blank rows and columns to the start of the grid. */
function addToStart(grid, rowsToAdd, colsToAdd) {
  return addColumnsToStart(addRowsToStart(grid, rowsToAdd), colsToAdd);
}

/*
 * Adds the given number of zero-filled columns to the right of grid.
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

/*
 * Adds the given number of zero-filled rows to the bottom of the grid.
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

/*
 * Adds the given number of zero-filled columns to the left of the grid.
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

/*
 * Adds the given number of zero-filled rows to the top of the grid.
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

/*
 * Removes empty rows from the start and end of the grid.
 * Does not remove any empty rows which are between non-empty rows, hence why
 * this is called "truncateEmptyRows" rather than "removeEmptyRows".
 */
function truncateEmptyRows(grid) {
  return removeEmptyRowsFromStart(removeEmptyRowsFromEnd(grid));
}

/* Removes empty rows from the start of the grid. */
function removeEmptyRowsFromStart(grid) {
  let rowIndex = 0; // Start at the first row.
  while (isZeros(grid[rowIndex])) {
    // Iterate through rows in order to find index of the first non-zero row.
    rowIndex += 1;
  }
  return grid.slice(rowIndex); // Return all rows from that row to the end of the grid.
}

/* Removes empty rows from the end of the grid. */
function removeEmptyRowsFromEnd(grid) {
  const numberOfRows = grid.length;
  let rowIndex = (numberOfRows- 1); // Start at the last row.
  while (isZeros(grid[rowIndex])) {
    // Iterate through rows in reverse order to index of the last non-zero row.
    rowIndex -= 1;
  }
  // Return all rows from start of grid to that row (including that row).
  return grid.slice(0, rowIndex + 1);
}

/*
 * Checks whether a given array contains only zeros.
 *
 * Note: A multi-dimensional array of zeros (ie a grid) will return false, since
 * the actual thing we check is whether each element in the top-level array is
 * zero, rather than each nested array ultimately containing only zeros.
 */
function isZeros(arr) {
  return arr.every(item => item === 0);
}

/* Removes empty columns from the start and end of the grid. */
function truncateEmptyColumns(grid) {
  return transpose(truncateEmptyRows(transpose(grid)));
}

/* Removes empty columns from the start of the grid. */
function removeEmptyColumnsFromStart(grid) {
  return transpose(removeEmptyRowsFromStart(transpose(grid)));
}

/* Removes empty columns from the end of the grid. */
function removeEmptyColumnsFromEnd(grid) {
  return transpose(removeEmptyRowsFromEnd(transpose(grid)));
}

/* Returns the m x n transpose of an n x m array (array of arrays). */
function transpose(arr) {
  const numRows = arr.length;
  const numCols = arr[0].length;
  let transposedArr = Patterns.createZerosGrid(numCols, numRows);
  for (let i = 0; i < numRows; i++ ) {
    for (let j = 0; j < numCols; j++) {
      transposedArr[j][i] = arr[i][j];
    }
  }
  return transposedArr;
}


// TODO: These last two functions I don't think will be used.

/* Checks whether the column at the given index in the grid contains only zeros. */
function columnIsZeros(grid, columnIndex) {
  return isZeros(getColumn(grid, columnIndex));
}

/* Returns an array of the column at the given index in the grid. */
function getColumn(grid, columnIndex) {
  let column = [];
  for (let row of grid) {
    column.push(row[columnIndex]);
  }
  return column;
}

export {
  equals,
  centerGrid,
  copyGrid,
  transpose,
  truncateEmptyColumns,
  truncateEmptyRows,
  resizeGridFromEnd,
  resizeGridFromStart,
};