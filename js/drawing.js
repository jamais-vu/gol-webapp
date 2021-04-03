/* jshint esversion: 6 */

import { getCellFromCoords, inGridBoundaries } from './canvas-helpers.js';
import { ToroidalGameOfLifeGrid } from './class.js';
import { updateStepCountText } from './html-helpers.js';

/* This class takes care of drawing the cells on the canvas. */
export class Drawing {

  constructor(canvas, grid, cellSize, xMax, yMax) {
    /* The canvas we're drawing on. */
    this.canvas = canvas;
    /* The canvas context. We specify a 2d canvas. */
    this.ctx = canvas.getContext('2d');
    /* The GameOfLifeGrid class instance we are drawing. */
    this.grid = grid;
    /* The size, in pixels, of the square cells we draw. */
    this.cellSize = cellSize;
    /* The x-coordinate of the right side of the grid, on the canvas. */
    this.xMax = xMax;
    /* The y-coordinate of the bottom side of the grid, on the canvas. */
    this.yMax = yMax;
    /* The time, in milliseconds, between each loopGrid call. */
    this.delay = 500;
    /* Whether grid transition and drawing occurs automatically via loopGrid. */
    this.isPaused = true;
    /* Whether the mouse is down on the canvas. */
    this.isMouseDown = false;
    /* When the mouse is down, this is 0 for left-click, 2 for right-click. */
    this.mouseDownButton = undefined;
    /* Map of visisted cells. */
    this.cellMap = cellMap;
  }

  /* Draws the cell at grid[i]][j] on the canvas, colored based on its state. */
  drawCell(i, j, cellState) {
    const x0 = (j * this.cellSize); // x-coordinate of upper-left corner of cell
    const y0 = (i * this.cellSize); // y-coordinate of upper-left corner of cell

    // We use `cellSize - 1` as the side lengths, because otherwise a cell with
    // coordinates (x0, y0) will overlap with the cell below it, the cell to right
    // of it, and the cell to the lower-right of it, since all of those use one of
    // x0 or y0 in their upper-left coordinate.
    if (cellState == 1) {
      // Live cells are colored whatever ctx.fillStyle is set to (default: red).
      this.ctx.fillRect(x0, y0, this.cellSize - 1, this.cellSize - 1);
    } else {
      // Dead cells are transparent and will be background color (default: white).
      this.ctx.clearRect(x0, y0, this.cellSize - 1, this.cellSize - 1);
    }
  }

  /* Draws the grid and step count.
   * Draws every cell, even if its state has not changed.
   */
  drawGrid() {
    updateStepCountText(this.grid.step);
    // Goes through each row and column in the grid, and draws each cell.
    for (let i = 0; i < this.grid.rowCount; i++) {   // i is y-axis (row index).
      for (let j = 0; j < this.grid.colCount; j++) { // j is x-axis (column index).
        this.drawCell(i, j, this.grid.getCellState(i, j));
      }
    }
  }

  /* Draws the previous grid and step count.
   * Only draws cells whose states have changed from the next step.
   */
  drawPreviousGrid() {
    updateStepCountText(this.grid.step);
    // Goes through each row and column in the grid, and draws changed cells.
    for (let i = 0; i < this.grid.rowCount; i++) {   // i is y-axis (row index).
      for (let j = 0; j < this.grid.colCount; j++) { // j is x-axis (column index).

        const cellState = this.grid.getCellState(i, j);
        const nextCellState = this.grid.getNextCellState(i, j);
        if (cellState !== nextCellState) {
          // Only draw the cell if its state changed from the next step.
          this.drawCell(i, j, cellState);
        }

      }
    }
  }

  /* Draws the next grid and step count.
   * Only draws cells whose states have changed from the previous step.
   */
  drawNextGrid() {
    updateStepCountText(this.grid.step);
    // Goes through each row and column in the grid, and draws changed cells.
    for (let i = 0; i < this.grid.rowCount; i++) {   // i is y-axis (row index).
      for (let j = 0; j < this.grid.colCount; j++) { // j is x-axis (column index).

        const cellState = this.grid.getCellState(i, j);
        const previousCellState = this.grid.getPreviousCellState(i, j);
        if (cellState !== previousCellState) {
          // Only draw the cell if its state changed from the previous step.
          this.drawCell(i, j, cellState);
        }

      }
    }
  }

  /* Draws the gridlines separating each cell. */
  drawGridLines() {
    const width = this.cellSize - 1;
    const height = this.cellSize - 1;

    for (let i = 0; i < this.grid.rowCount; i++) {   // i is y-axis (row index).
      for (let j = 0; j < this.grid.colCount; j++) { // j is x-axis (column index).
        this.ctx.strokeRect(j * this.cellSize, i * this.cellSize, width, height);
      }
    }
  }

  /* Sets up canvas on page load. */
  initialCanvasDraw() {
    // Set gridline color and draw gridlines.
    this.ctx.fillStyle = 'black';
    this.drawGridLines();
    // Set live cell color and draw cells.
    // ctx.fillStyle is not changed after this, since it's only used in drawGrid.
    this.ctx.fillStyle = 'red';
    this.drawGrid();
  }

  /* Animation frame loop for drawing the grid.
   *
   * If paused: does nothing.
   * If not paused: transitions forward one step, then draws the grid.
   *
   * and in either case, ends by calling itself again with the given delay.
   *
   * Note: In the case where isPaused === false, this mutates the `grid` object.
   */
  loopGrid() {
    // If it's playing, then we move forward 1 step and draw that step.
    if (this.isPaused === false) {
      this.grid.nextStep(); // Note: This mutates `grid` object by moving it forward 1 step.
      this.drawNextGrid();
    }
    // And regardless of whether it was paused or not, we queue the next call.
    // We need to bind `this` for loopGrid so we don't lose context when passing
    // it to setTimeout.
    setTimeout(() => {
      requestAnimationFrame(this.loopGrid.bind(this));
    }, this.delay
    );
  }

  /* Tracks which cells the mouse moves over on canvas as long as the mouse button
   * is held down, and sets cells to alive if the mouse button is left-click and
   * dead if the mouse button is right-click.
   *
   * Note: This mutates the `grid` object.
   */
  holdDraw(event) {
    const xPos = event.offsetX;
    const yPos = event.offsetY;

    // Determine the new state we set cells to, depending on mouse button.
    let newCellState;
    if (this.mouseDownButton === 0) {
      newCellState = 1; // Click-and-hold left click turns cells alive.
    } else if (this.mouseDownButton === 2) {
      newCellState = 0; // Click-and-hold right click turns cells dead.
    }

    // Initialize variables for the time delay between each repeat() call.
    let holdDelay = 50;  // Initial hold delay (in milliseconds).

    let timeoutID; // ID of the timer that will be set by setTimeout in repeat().

    // TODO: Docs. Explain why `this` works due to binding repeat() later.
    function repeat() {
      this.holdDrawRepeatHelper(xPos, yPos, newCellState);
      timeoutID = setTimeout(repeat.bind(this), holdDelay);
    }

    /* Clears the repeat() function that was queued by setTimeout. */
    this.canvas.addEventListener('mouseup', () => clearTimeout(timeoutID), {once: true});
    let boundRepeat = repeat.bind(this);
    boundRepeat(); // Call repeat() for the first time, to begin the loop.
  }

  /* Helper function for the inner `repeat` function in `holdDraw`.
   *
   * If the given xy-coordinate (xPos, yPos) is within the grid boundaries, then
   * we get the corresponding ij-coordinate, and check if it's in the cellMap.
   * If it is, we don't touch it.
   * If it isn't, then we set the cell at that ij-coordinate to newCellState,
   * and add that ij-coordinate to the cellMap.
   */
  holdDrawRepeatHelper(xPos, yPos, newCellState) {
    // Only update the grid if the user clicked within its bounds.
    if (inGridBoundaries(xPos, yPos, this.xMax, this.yMax)) {

      let [i, j] = getCellFromCoords(xPos, yPos, this.cellSize); // row and column of cell

      // Only check and modify the cell if we haven't visited it yet.
      if (this.cellMap.has(i, j) === false) {
        const cellState = this.grid.getCellState(i, j); // State is either 1 or 0.
        // We add it to the visited set, then flip and draw the cell.
        if (cellState !== newCellState) {
          // If is not in the new state, we set it to the new state.
          this.grid.setCellState(i, j, newCellState);
          this.drawCell(i, j, newCellState); // Draw the new cell state on canvas.
        }
        // But if the cell is already in the new state, we don't touch it.
        // We just add it to the visited cells and move on.
        this.cellMap.set(i, j, newCellState);
      }
    }
  }

}


/* Wrapper object for a map of ij coords (as strings 'i,j') to cell state.
 *
 * This object is used in `holdDraw()`, to store which cells of the grid the
 * mouse has already "visited" while the mouse button is held down.
 */
let cellMap = {
  cells: new Map(), // Map of string `${i},${j}` to state of cell at coord i,j

  set(i, j, state) { // Record the state of the cell at i,j
    this.cells.set(`${i},${j}`, state);
  },

  has(i, j) { // Check if the cell i,j is in the Map
    return this.cells.has(`${i},${j}`);
  },

  get(i, j) { // Get the recorded state of the cell i,j
    return this.cells.get(`${i},${j}`);
  },

  clear() { // Clear all items from the Map
    this.cells.clear();
  },
};