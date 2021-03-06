/* jshint esversion: 6 */

import { getCellFromCoords, inGridBoundaries } from './coordinate-helpers.js';
import { cellMap } from './cellMap.js';
import { ToroidalGameOfLifeGrid } from './class.js';
import { updatePauseButton, updateStepCountText } from './html-helpers.js';

// TODO: I started adding '@modifies' tags to docs to make it clear which
// methods modify more than the canvas, but since nearly every function also
// modifies `this.canvas` or `this.ctx`, those tags are probably misleading
// if I omit that it modifies those. But if I don't omit those, then
// Might remove them.

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
    this.cellMap = new cellMap();
  }

  /* Draws the cell at grid[i]][j] on the canvas, colored based on its state.
   *
   * Only modifies canvas.
   */
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
   *
   * Only modifies canvas and HTML.
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
   *
   * Only modifies canvas and HTML.
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
   *
   * Only modifies canvas and HTML.
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

  /* Draws the gridlines separating each cell.
   *
   * Only modifies canvas and HTML.
   */
  drawGridLines() {
    const width = this.cellSize - 1;
    const height = this.cellSize - 1;

    for (let i = 0; i < this.grid.rowCount; i++) {   // i is y-axis (row index).
      for (let j = 0; j < this.grid.colCount; j++) { // j is x-axis (column index).
        this.ctx.strokeRect(j * this.cellSize, i * this.cellSize, width, height);
      }
    }
  }

  /* Sets up canvas on page load.
   *
   * Only modifies canvas and HTML.
   */
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
   * ...and in either case, ends by calling itself again with the given delay.
   *
   * @modifies {this.grid}
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

  /* Pauses drawing and updates HTML button text to reflect change. */
  pause() {
    this.isPaused = true;
    updatePauseButton(this.isPaused);
  }

  /* Unpauses drawing and updates HTML button text to reflect change. */
  unpause() {
    this.isPaused = false;
    updatePauseButton(this.isPaused);
  }

  /* If drawing is paused, unpause it. If drawing is unpaused, pause it. */
  togglePause() {
    if (this.isPaused) {
      this.unpause();
    } else {
      this.pause();
    }
  }

  /* Tracks which cells the mouse moves over on canvas as long as the mouse button
   * is held down, and sets cells to alive if the mouse button is left-click and
   * dead if the mouse button is right-click.
   *
   * @modifies {this.grid}
   * @modifies {this.cellMap}
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
   *
   * @modifies {this.grid}
   * @modifies {this.cellMap}
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

  /* Gets xy position of mouse, and if it's over the grid, modifies cells.
   *
   * @modifies {this.grid}
   * @modifies {this.cellMap}
   * @modifies {this.isMouseDown}
   */
  canvasMouseDownHandler(event) {
    this.mouseDownButton = event.button;

    // xy-coordinate of mouse press, relative to canvas origin.
    const xPos = event.offsetX;
    const yPos = event.offsetY;

    // Only update the grid if the user clicked within its bounds.
    if (inGridBoundaries(xPos, yPos, this.xMax, this.yMax)) {
      // Get the row and column of the mouse press.
      let [i, j] = getCellFromCoords(xPos, yPos, this.cellSize);

      // To support clicking, rather than just click-and-hold, we immediately
      // modify the state of the cell at the position of the mouse press, and
      // then add it to cellMap so holdDraw() knows we've already visited it.
      if (this.mouseDownButton === 0) {
        // If left-click, flip state of cell at mouse.
        this.flipCellAtCoords(xPos, yPos);
      } else if (this.mouseDownButton === 2) {
        // If right-click, set cell at mouse to dead.
        this.grid.setCellState(i, j, 0);
        this.drawCell(i, j, 0);
      }
      this.cellMap.set(i, j, this.grid.getCellState(i, j));
      this.isMouseDown = true;
    }
  }

  /* Flips state of the cell at the given canvas coordinates.
   * Note: This assumes the given coordinates are valid (ie, on the grid).
   *
   * @modifies {this.grid}
   */
  flipCellAtCoords(xPos, yPos) {
    // Get the row and column of the cell.
    let [i, j] = getCellFromCoords(xPos, yPos, this.cellSize);
    this.grid.flipCell(i, j);
    this.drawCell(i, j, this.grid.getCellState(i, j)); // Draw the new cell state on canvas.
  }

}