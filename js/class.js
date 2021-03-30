/* jshint esversion: 6 */

import * as Grid from './grid.js';
import * as Life from './life.js';
import * as Patterns from './patterns.js';

/* Encapsulates various parameters and functions related to grid state. */
class GameOfLifeGrid {

  // TODO: Add parameter to pass cells, then center those.
  constructor(rowCount, colCount) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.cells = Patterns.createRandomGrid(rowCount, colCount);
    this.startCells = Grid.copyGrid(this.cells);
    this.nextCells = undefined; // Stores states of next cells in previousStep()
    this.history = [];
    this.step = 0;
  }


  // Step functions
  // --------------
  // These transition the grid state forward/backward, using Game of Life rules.

  /* Moves the grid state back one step. */
  previousStep() {
    // There are no previous steps at step 0
    if (this.step > 0) {
      // When we move back to step n, we store the states of cells of step n+1
      // as `this.nextCells`, in order to know which cells have changed between
      // those two steps.
      this.nextCells = this.cells;
      // Remove the most recent state from history and set cells to it
      this.cells = this.history.pop();
      this.step -= 1;
    }
  }

  /* Moves the grid state forward one step. */
  nextStep() {
    this.history.push(this.cells);
    this.cells = Life.transitionGrid(this.cells);
    this.step += 1;
  }

  /* Transitions grid state to step n, via calls to nextStep/previousStep. */
  goToStep(n) {
    if (n > this.step) {
      const stepsToGo = (n - this.step);
      for (let i = 1; i <= stepsToGo; i++) {
        this.nextStep();
      }
    } else if (n < this.step) {
      const stepsToGo = (this.step - n);
      for (let i = 1; i <= stepsToGo; i++) {
        this.previousStep();
      }
    } else {
      // in this case we do nothing because n == step
    }
  }

  // Cell functions
  // --------------
  // These access or modify individual cells in the grid.

  /* Returns the state of the cell at row i, column j. */
  getCellState(i, j) {
    return this.cells[i][j];
  }

  /* Sets the cell at row i, column j to the given state. */
  setCellState(i, j, state) {
    this.cells[i][j] = state;
  }

  /* Flips the state of the cell at i,j. */
  flipCell(i, j) {
    this.cells[i][j] = (this.cells[i][j] === 0 ? 1 : 0);
  }

  /*
   * Returns the previous state of the cell at (i, j), or NaN if there is no
   * previous state.
   *
   * This is used in the drawNextGrid function, to optimise canvas rendering by
   * only drawing cells which have changed from the previous step.
   */
  getPreviousCellState(i, j) {
    if (this.step === 0) {
      return NaN;
    } else {
      // `this.history[this.step - 1]` is the cells at the previous step.
      return this.history[this.step - 1][i][j];
    }
  }

  /*
   * Returns the next state of the cell at (i, j), or NaN if there is no
   * next state.
   *
   * This is used in the drawPreviousGrid function, to optimise canvas rendering
   * by only drawing cells which have changed from the next step.
   */
  getNextCellState(i, j) {
    if (this.nextCells === undefined) {
      return NaN;
    } else {
      return this.nextCells[i][j];
    }
  }


  // Pattern functions
  // -----------------
  // These modify the state of the whole grid.
  // The "state" of the grid is used loosely to refer to the combination of
  // its cells, its history, its step count, and its startCells.

  /* Sets all cells to zero and clears history and step count. */
  clear() {
    this.cells = Patterns.createZerosGrid(this.rowCount, this.colCount);
    this.history = [];
    this.step = 0;
  }

  /* Resets state to start. */
  reset() {
    this.cells = Grid.copyGrid(this.startCells);
    this.history = [];
    this.step = 0;
  }

  /* Sets current state as start state. */
  setAsStart() {
    this.startCells = Grid.copyGrid(this.cells);
    this.history = [];
    this.step = 0;
  }

  /* Change cells to given pattern. */
  changePattern(patternCells) {
    this.cells = Grid.centerGrid(patternCells, this.rowCount, this.colCount);
    // TODO: Not sure I actually want changing pattern to change startCells
    // this.startCells = patternCells;
    this.history = [];
    this.step = 0;
  }

  /* Clears state and randomly sets cells alive/dead. */
  randomize() {
    this.cells = Patterns.createRandomGrid(this.rowCount, this.colCount);
    this.history = [];
    this.step = 0;
  }
}

/*
 * A GameOfLifeGrid with special features to only consider the "center" of the
 * grid when drawing on the canvas. This is done to simulate an infinite grid.
 *
 * At creation, a `padding` number is passed as an argument. This adds an
 * additional number of rows and columns to the start and end of the cells.
 * The various class methods are implemented in a way such that our transition
 * logic takes these cells into account when determining the next state, but our
 * drawing logic ignores these additional cells.
 *
 * From the point of view of our drawing logic, instances of this class can be
 * treated the same as instances of its parent class.
 */
class PaddedGameOfLifeGrid extends GameOfLifeGrid {

  /*
   * Constructs a GameOfLifeGrid, with the given padding added to the start
   * and end of each row and column.
   *
   * `rowCount` and `colCount` specify the centered subset of the grid which
   * we iterate over for drawing.
   * `trueRowCount` and `trueColCount` are the true dimensions of the grid of
   * cells.
   */
  constructor(rowCount, colCount, padding) {
    // super() creates a GameOfLifeGrid with the given padding added to the
    // start and end of each row and column.
    super(rowCount + (padding * 2), colCount + (padding * 2));

    // Then override that rowCount and colCount with given numbers.
    this.rowCount = rowCount;
    this.colCount = colCount;

    // Then create new fields storing the true row count and column count.
    this.trueRowCount = rowCount + (padding * 2);
    this.trueColCount = colCount + (padding * 2);

    this.padding = padding;
  }

  // Step functions
  // --------------
  // We don't override step functions because those operate on the whole cells,
  // rather than just the subset we consider relevant for drawing.

  // Cell functions
  // --------------
  // We override all of these, because they all rely on ij-coordinates.
  // The way our canvas drawing works is by treating the canvas xy-coord (0, 0)
  // as the cell ij-coord (0, 0), which corresponds to the start of the grid.

  /* Returns the state of the cell at row i, column j. */
  getCellState(i, j) {
    return this.cells[i + this.padding][j + this.padding];
  }

  /* Sets the cell at row i, column j to the given state. */
  setCellState(i, j, state) {
    this.cells[i + this.padding][j + this.padding] = state;
  }

  /* Flips the state of the cell at i,j. */
  flipCell(i, j) {
    this.cells[i + this.padding][j + this.padding] = (this.cells[i + this.padding][j + this.padding] === 0 ? 1 : 0);
  }

  /*
   * Returns the previous state of the cell at (i, j), or NaN if there is no
   * previous state.
   */
  getPreviousCellState(i, j) {
    if (this.step === 0) {
      return NaN;
    } else {
      // `this.history[this.step - 1]` is the cells at the previous step.
      return this.history[this.step - 1][i + this.padding][j + this.padding];
    }
  }

  // Pattern functions
  // -----------------
  // We don't override reset() or setAsStart() because those are not dependent
  // on the dimensions of the cells array.

  /* Sets all cells to zero and clears history and step count. */
  clear() {
    this.cells = Patterns.createZerosGrid(this.trueRowCount, this.trueColCount);
    this.history = [];
    this.step = 0;
  }

  /* Change cells to given pattern. */
  changePattern(patternCells) {
    this.cells = Grid.centerGrid(patternCells, this.trueRowCount, this.trueColCount);
    // TODO: Not sure I actually want changing pattern to change startCells
    // this.startCells = patternCells;
    this.history = [];
    this.step = 0;
  }

  /* Clears state and randomly sets cells alive/dead. */
  randomize() {
    this.cells = Patterns.createRandomGrid(this.trueRowCount, this.trueColCount);
    this.history = [];
    this.step = 0;
  }
}

/* Game of Life on the surface of a torus. */
class ToroidalGameOfLifeGrid extends GameOfLifeGrid {

  // The only class method we override, since the only difference between this
  // and our 2D plane grid is how we determine cell neighbors.
  /* Moves the grid state forward one step. */
  nextStep() {
    this.history.push(this.cells);
    this.cells = Life.transitionTorusGrid(this.cells);
    this.step += 1;
  }
}

export {
  GameOfLifeGrid,
  PaddedGameOfLifeGrid,
  ToroidalGameOfLifeGrid,
};