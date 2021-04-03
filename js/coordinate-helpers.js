/* jshint esversion: 6 */

/* Helper functions for working in the xy-coordinate system of the canvas, and
 * relating those coordinates to the ij-coordinate system of the grid.
 */

/* Gets the row and column of the cell on the canvas at the xy coordinate. */
export function getCellFromCoords(xPos, yPos, cellSize) {
  return [
    Math.floor(yPos / cellSize), // Row index
    Math.floor(xPos / cellSize), // Column index
  ];
}

/* Checks whether the given xy coordinate in the canvas is within the grid. */
export function inGridBoundaries(xPos, yPos, xMax, yMax) {
  return (
    (0 <= xPos && xPos <= xMax) &&
    (0 <= yPos && yPos <= yMax)
  );
}