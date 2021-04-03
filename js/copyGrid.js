/* jshint esversion: 6 */

/* Creates a deep copy of the given 2d array. Cannot handle deeper nesting. */
export function copyGrid(grid) {
  let newGrid = [];
  for (let i = 0; i < grid.length; i ++) {
    newGrid.push(grid[i].slice());
  }
  return newGrid;
}