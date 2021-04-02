/* jshint esversion: 6 */

import { ToroidalGameOfLifeGrid } from './class.js';
import { updateStepCountText } from './html-helpers.js';

/* This class takes care of drawing the cells on the canvas. */
export class Drawing {

  constructor(ctx, grid, cellSize, xMax, yMax) {
    /* The canvas context. */
    this.ctx = ctx;
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
          drawCell(i, j, cellState);
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

}