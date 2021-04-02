/* jshint esversion: 6 */

import { presetPatterns } from './patterns.js';
import { ToroidalGameOfLifeGrid } from './class.js';
import {
  populateDebugInfoTable,
  populateSelectPattern,
  updateCanvasMouseCoords,
  updateStepCountText,
  updateStepDelaySliderText,
  updateWindowMouseCoords,
  windowSizeCheck,
} from './html-helpers.js';

/* This file contains logic for drawing the grid on canvas, and for handling
 * user interactions via button or mouse press.
 *
 * Structure (in order):
 * 1) Set up the canvas and grid.
 * 2) Initalize variables relevant for drawing and user interaction.
 * 3) Add event listeners to buttons and other elements, and declare
 * handlers for those events.
 * 4) Drawing functions.
 */

// Set up canvas
const canvas = document.querySelector('.myCanvas');
const ctx = canvas.getContext('2d'); // specifies canvas is 2d

/* We set the canvas size to be slightly less than the viewport size, since
 * we don't want to user to have to scroll horizontally to see the full grid. */
canvas.width = (window.innerWidth * 0.95); // viewport width
canvas.height = (window.innerHeight * 0.95); // viewport height

/* Using a preset cell size, we calculate the maximum number of rows and columns
 * that will fit in the canvas, and then create a grid with those numbers.
 */
const cellSize = 10; // Cell square side length, in pixels.
const rows = Math.floor(canvas.height / cellSize);
const columns = Math.floor(canvas.width / cellSize);
let grid = new ToroidalGameOfLifeGrid(rows, columns);

/* Calculate grid dimensions as xy coordinates.
 * Note: These will be slightly less than, or equal to, the width and height of
 * the canvas, since depending on the cellSize there may be "leftover" pixels
 * we don't use because they're less than the size of a full cell. */
const xMax = (columns * cellSize);
const yMax = (rows * cellSize);


/* Initialize variables used to control drawing and user interactions.
 *
 * TODO: I dislike using top-level variables here. In the future, we should
 * encapsulate all the stuff related to drawing in its own class or module. */
let delay = 500;             // Intial time (ms) between each loopGrid() call.
let isPaused = true;         // Drawing starts paused.
let isMouseDown = false;     // Whether the mouse is down on the canvas.
let mouseDownButton;         // Set 0 if mousedown is left-click, 2 for right.

/* Initalize HTML elements and draw gridlines and cells on canvas. */
updateStepDelaySliderText(delay); // Show initial delay between grid steps.
populateSelectPattern();          // Populate preset patterns dropdown menu.
populateDebugInfoTable(xMax, yMax, rows, columns, cellSize);
windowSizeCheck(xMax, yMax);   // Check whether user's browser is a good size

initialCanvasDraw(); // Start by drawing the grid for step 0.


/* UI logic
 *
 * First we attach event listeners to various webpage elements.
 * Then we declare the functions those event listeners call.
 *
 * Some functions are declared anonymously in the actual `addEventListener()`
 * call, either for clarity or due to the shortness of the function itself.
 */

/* Event Listeners
 *
 * Set up event listeners for webpage elements. Ordered alphabetically.
 * TODO: This looks messy to me. Would like to find a better way to organize.
 * Maybe place in their own module.
 */

/* Displays xy position of mouse, relative to upper-left corner of canvas. */
canvas.addEventListener('mousemove', updateCanvasMouseCoords);
/* Flips the state of the cell at the position of the mouse click. */
canvas.addEventListener('mousedown', canvasMouseDownHandler);
/* While the mouse is held down, any cell under it is set to alive. */
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    holdDraw(event);
  }
});
/* Sets isMouseDown to false, which stops click-and-hold drawing of cells. */
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  cellMap.clear(); // We empty the map of visited cells when mouse is lifted.
});
/* Sets isMouseDown to false if the mouse moves out of the canvas, regardless of
   whether the mouse is still held down. */
canvas.addEventListener('mouseout', () => {
  isMouseDown = false;
  cellMap.clear();
});
/* Prevent right-click on canvas from opening the context menu. */
canvas.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});

/* Clears the canvas. Sets all cells to 0, clears history, resets step count. */
clearCanvasButton.addEventListener('click', () => {
  grid.clear();
  drawGrid();
});
clearCanvasButton.addEventListener('click', pause);

/* Gets value of selectPattern dropdown, and passes that to changePattern(). */
changePatternButton.addEventListener('click', changePatternFromDropdown);
changePatternButton.addEventListener('click', pause);

/* Shows/hide debug info table depending on whether box is checked. */
debugCheckbox.addEventListener('change', function() {
  if (this.checked) {
    document.getElementById('debugInfoTable').style.display = 'table';
  } else {
    document.getElementById('debugInfoTable').style.display = 'none';
  }
});

/* Sets up arrow keys to control grid transition, space key to pause/unpause. */
document.addEventListener('keydown', keydownHandler);

/* Pauses/unpauses grid transition. */
pauseButton.addEventListener('click', pauseButtonHandler);

/* Moves to previous/next step so long as previous/next step button is held. */
previousStepButton.addEventListener('mousedown', clickAndHoldPreviousStepButton);
nextStepButton.addEventListener('mousedown', clickAndHoldNextStepButton);

/* Replaces the current grid with a randomly-populated grid. */
randomizeButton.addEventListener('click', () => {
  grid.randomize();
  drawGrid();
});
randomizeButton.addEventListener('click', pause);

/*
 * Resets the displayed grid to the state it was in when the page was loaded,
 * prior to any user modifications.
 *
 * Note: This is different from its state at step 0, since the user may modify
 * the grid at any step, including step 0.
 */
resetPatternButton.addEventListener('click', () => {
  grid.reset();
  drawGrid();
});
resetPatternButton.addEventListener('click', pause);

/* Sets current grid as start grid, then clears history and step count. */
setAsStartPatternButton.addEventListener('click', () => {
  grid.setAsStart();
  drawGrid();
});

/* Changes the delay between drawing frames. */
stepDelaySlider.addEventListener('input', changeDelayBetweenSteps);

/* Transitions the grid forward/backward to user-inputted step. */
stepInputSubmit.addEventListener('click', stepInputHandler);
stepInputSubmit.addEventListener('click', pause);
/* Disable pressing "Enter" key on step input, since that causes page reload. */
stepInput.addEventListener('keydown', (event) => {
  if (event.code === 'Enter') {
    event.preventDefault();
  }
});

/* Displays the xy position of the mouse in the window. */
window.addEventListener('mousemove', updateWindowMouseCoords);


/* Event handlers
 *
 * TODO: This is also disorganised. Could order them alphabetically, or in
 * order of their appearance in the above Event Listeners section. Could also
 * place in own module.
 */

/* Gets xy position of mouse, and if it's over the grid, modifies cells. */
function canvasMouseDownHandler(event) {
  // Store which mouse button was pressed, for use in holdDraw()
  mouseDownButton = event.button;

  // xy-coordinate of mouse press, relative to canvas origin.
  const xPos = event.offsetX;
  const yPos = event.offsetY;

  // Only update the grid if the user clicked within its bounds.
  if (inGridBoundaries(xPos, yPos)) {
    let [i, j] = getCellFromCoords(xPos, yPos); // row and col of mouse press

    // To support clicking, rather than just click-and-hold, we immediately
    // modify the state of the cell at the position of the mouse press, and
    // then add it to cellMap so holdDraw() knows we've already visited it.
    if (mouseDownButton === 0) {
      // If left-click, flip state of cell at mouse.
      flipCellAtCoords(xPos, yPos);
    } else if (mouseDownButton === 2) {
      // If right-click, set cell at mouse to dead.
      grid.setCellState(i, j, 0);
      drawCell(i, j, 0);
    }
    cellMap.set(i, j, grid.getCellState(i, j));
    isMouseDown = true;
  }
}

/* Changes grid to pattern selected in the 'Select Pattern' dropdown menu. */
function changePatternFromDropdown() {
  const patternName = (document.getElementById("selectPattern")).value;
  grid.changePattern(presetPatterns[patternName].grid);
  drawGrid();
}

/* "Pauses" drawing, by having loopGrid() do nothing but call itself again. */
function pause() {
  isPaused = true;
  pauseButton.innerHTML = 'Play';
}

/* "Unpauses" loopGrid(). */
function unpause() {
  isPaused = false;
  pauseButton.innerHTML = 'Pause';
}

/* Controls whether the grid automatically steps forward. */
function pauseButtonHandler() {
  if (isPaused) {
    unpause();
  } else {
    pause();
  }
}

/* Handles grid transitions (and drawing new state) based on key presses.
 *
 * If the key pressed was the left or right arrow, repeatedly calls previous or
 * next step, respectively, for as long as the key is down.
 * If the key pressed was the space button, either pauses or unpauses the grid.
 */
function keydownHandler(event) {
  const key = event.code;
  if (key === 'ArrowLeft') {
    event.preventDefault(); // Prevents key from executing its default action.
    clickAndHold(document, [pause], [previousStep, drawPreviousGrid], 'keyup');
  } else if (key === 'ArrowRight') {
    event.preventDefault();
    clickAndHold(document, [pause], [nextStep, drawNextGrid], 'keyup');
  } else if (key === 'Space') {
    event.preventDefault();
    pauseButtonHandler();
  }
}

/* Note on previousStep() and nextStep():
 *
 * `previousStep()` and `nextStep()` are wrapper functions for calling their
 * respective GameOfLifeGrid class methods when passed to `clickAndHold`.
 * We could use binding here, and pass `grid.previousStep.bind(grid)` and
 * `grid.nextStep.bind(grid)` to `clickAndHold` and that would also work.
 *
 * I'm not sure which is best practice, but I think the wrapper functions are
 * faster than binding.
 */

/* Wrapper function to move the grid state back one step. */
function previousStep() {
  grid.previousStep();
}

/* Wrapper function to move the grid state forward one step. */
function nextStep() {
  grid.nextStep();
}

/* Wrapper for calling clickAndHoldButton() with previousStep. */
function clickAndHoldPreviousStepButton() {
  clickAndHold(previousStepButton, [pause], [previousStep, drawPreviousGrid], 'mouseup');
}

/* Wrapper for calling clickAndHoldButton() with nextStep. */
function clickAndHoldNextStepButton() {
  clickAndHold(nextStepButton, [pause], [nextStep, drawNextGrid], 'mouseup');
}

/*
 * When the button is pressed, calls each function of the array runOnceFunctions
 * in order, and then repeatedly calls each function of the array
 * repeatedFunctions, with a certain delay, as long as the specified stopEvent
 * does not occur (stopEvent is typically 'mouseup' or 'keyup').
 *
 * This is used with the previous/next step buttons and left/right arrow keys,
 * to pause and then repeatedly call previousStep()/nextStep() and drawGrid(),
 * but accepts any button and any functions.
 * (More generally, the "button" could be any arbitrary element, with a handler
 * which calls this in the case of any arbitrary event.)
 */
function clickAndHold(button, runOnceFunctions, repeatedFunctions, stopEvent) {
  // Call each of the "run once" functions immediately, in given order.
  for (let func of runOnceFunctions) {
    func();
  }

  // Initialize variables for the time delay between each repeat() call.
  let holdDelay = 500;  // Initial hold delay (in milliseconds).
  const minDelay = 50;  // Minimum hold delay (in milliseconds).

  let timeoutID; // ID of the timer that will be set by setTimeout in repeat().

  function repeat() {
    // Call each of the repeated functions, in given order.
    for (let func of repeatedFunctions) {
      func();
    }

    // Set a delayed call to repeat(), with the current holdDelay.
    timeoutID = setTimeout(repeat, holdDelay);

    /* Then calculate the next setTimeout delay.
     * The next delay is halfway between current delay and minimum delay.
     * This converges asymptotically on the minimum delay, so the user will
     * feel like it "speeds up" as they hold the button.
     */
    // holdDelay = ((holdDelay + minDelay) / 2);
    // TODO: Actually it feels more snappy to just immediately go fast after
    // holding down for the initial delay.
    holdDelay = minDelay;
  }

  // When the stopEvent occurs, clears the repeat() function that was queued by
  // setTimeout.
  //
  // We only need to clear the most-recent timeout to stop the loop, because
  // each setTimeout call is "chained": it only calls the next setTimeout when
  // the currently-queued one executes, So at any given moment there is only
  // one setTimeout call queued.
  button.addEventListener(stopEvent, () => clearTimeout(timeoutID), {once: true});

  repeat(); // Call repeat() for the first time, to begin the loop.
}

/* Transitions the grid to the user-inputted step, and then draws the grid. */
function stepInputHandler() {
  const desiredStep = parseInt(stepInput.value); // stepInput is the input box
  if ( !isNaN(desiredStep) ) {
    // Empty input box will raise NaN warning, so we check before proceeding.
    grid.goToStep(desiredStep);
    drawGrid();
    stepInput.value = desiredStep;
  }
}

/* Changes the delay between steps to the value of the stepDelaySlider. */
function changeDelayBetweenSteps() {
  delay = stepDelaySlider.value;
  updateStepDelaySliderText(delay);
}

/* Flips state of the cell at the given canvas coordinates.
 * Note: This assumes the given coordinates are valid (ie, on the grid).
 */
function flipCellAtCoords(xPos, yPos) {
  let [i, j] = getCellFromCoords(xPos, yPos); // Row and column of cell
  grid.flipCell(i, j);
  drawCell(i, j, grid.getCellState(i, j)); // Draw the new cell state on canvas.
}

/* Gets the row and column of the cell on the canvas at the xy coordinate. */
function getCellFromCoords(xPos, yPos) {
  return [
    Math.floor(yPos / cellSize), // Row index
    Math.floor(xPos / cellSize), // Column index
  ];
}

/* Checks whether the given xy coordinate in the canvas is within the grid. */
function inGridBoundaries(xPos, yPos) {
  return ((0 <= xPos && xPos <= xMax) && (0 <= yPos && yPos <= yMax));
}


/* Drawing logic
 *
 * Most of these do not change the grid state, but there are two which do:
 *  - `loopGrid()` mutates the `grid` object if `isPaused === false`.
 *  - `holdDraw` mutates the `grid` object.
 *
 * Aside from those two, the only non-canvas changes any of these perform are
 * that the drawGrid functions update the step count HTML element.
 */

/* Animation frame loop for drawing the grid.
 *
 * If paused: does nothing
 * If not paused: draws the grid, then transitions forward one step
 *
 * and in either case, ends by calling itself again with the given delay.
 *
 * Note: In the case where isPaused === false, this mutates the `grid` object.
 */
function loopGrid() {
  if (isPaused) {
    // We don't do anything if it's paused, just call again
    setTimeout(() => requestAnimationFrame(loopGrid), delay);
  } else {
    // If it's playing, then we move forward 1 step, then call again
    nextStep(); // Note: This mutates `grid` object by moving it forward 1 step.
    drawNextGrid();
    setTimeout(() => requestAnimationFrame(loopGrid), delay);
  }
}

/* Draws the grid and step count. Does NOT modify the grid or step count.
 * Draws every cell, even if its state has not changed.
 */
function drawGrid() {
  updateStepCountText(grid.step);
  // Goes through each row and column in the grid, and draws each cell.
  for (let i = 0; i < grid.rowCount; i++) {   // i is y-axis (row index).
    for (let j = 0; j < grid.colCount; j++) { // j is x-axis (column index).
      drawCell(i, j, grid.getCellState(i, j));
    }
  }
}

/*
 * Draws the previous grid and step count. Does NOT modify the grid or step count.
 * Only draws cells whose states have changed from the next step.
 */
function drawPreviousGrid() {
  updateStepCountText(grid.step);
  // Goes through each row and column in the grid, and draws changed cells.
  for (let i = 0; i < grid.rowCount; i++) {   // i is y-axis (row index).
    for (let j = 0; j < grid.colCount; j++) { // j is x-axis (column index).

      const cellState = grid.getCellState(i, j);
      const nextCellState = grid.getNextCellState(i, j);
      if (cellState !== nextCellState) {
        // Only draw the cell if its state changed from the next step.
        drawCell(i, j, cellState);
      }

    }
  }
}

/* Draws the next grid and step count. Does NOT modify the grid or step count.
 * Only draws cells whose states have changed from the previous step.
 */
function drawNextGrid() {
  updateStepCountText(grid.step);
  // Goes through each row and column in the grid, and draws changed cells.
  for (let i = 0; i < grid.rowCount; i++) {   // i is y-axis (row index).
    for (let j = 0; j < grid.colCount; j++) { // j is x-axis (column index).

      const cellState = grid.getCellState(i, j);
      const previousCellState = grid.getPreviousCellState(i, j);
      if (cellState !== previousCellState) {
        // Only draw the cell if its state changed from the previous step.
        drawCell(i, j, cellState);
      }

    }
  }
}

/* Draws the cell at grid[i]][j] on the canvas, colored based on its state. */
function drawCell(i, j, cellState) {
  const x0 = (j * cellSize); // x-coordinate of upper-left corner of cell
  const y0 = (i * cellSize); // y-coordinate of upper-left corner of cell

  // We use `cellSize - 1` as the side lengths, because otherwise a cell with
  // coordinates (x0, y0) will overlap with the cell below it, the cell to right
  // of it, and the cell to the lower-right of it, since all of those use one of
  // x0 or y0 in their upper-left coordinate.
  if (cellState == 1) {
    // Live cells are colored whatever ctx.fillStyle is set to (default: red).
    ctx.fillRect(x0, y0, cellSize - 1, cellSize - 1);
  } else {
    // Dead cells are transparent and will be background color (default: white).
    ctx.clearRect(x0, y0, cellSize - 1, cellSize - 1);
  }
}

/* Draws the gridlines separating each cell. */
function drawGridLines() {
  const width = cellSize - 1;
  const height = cellSize - 1;

  for (let i = 0; i < grid.rowCount; i++) {   // i is y-axis (row index).
    for (let j = 0; j < grid.colCount; j++) { // j is x-axis (column index).
      ctx.strokeRect(j * cellSize, i * cellSize, width, height);
    }
  }
}

/* Sets up canvas on page load. */
function initialCanvasDraw() {
  // Set gridline color and draw gridlines.
  ctx.fillStyle = 'black';
  drawGridLines();
  // Set live cell color and draw cells.
  // ctx.fillStyle is not changed after this, since it's only used in drawGrid.
  ctx.fillStyle = 'red';
  drawGrid();
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

/* Tracks which cells the mouse moves over on canvas as long as the mouse button
 * is held down, and sets cells to alive if the mouse button is left-click and
 * dead if the mouse button is right-click.
 *
 * Note: This mutates the `grid` object.
 */
function holdDraw(event) {

  const xPos = event.offsetX;
  const yPos = event.offsetY;

  // Determine the new state we set cells to, depending on mouse button.
  let newCellState;
  if (mouseDownButton === 0) {
    newCellState = 1; // Click-and-hold left click turns cells alive.
  } else if (mouseDownButton === 2) {
    newCellState = 0; // Click-and-hold right click turns cells dead.
  }

  // Initialize variables for the time delay between each repeat() call.
  let holdDelay = 50;  // Initial hold delay (in milliseconds).

  let timeoutID; // ID of the timer that will be set by setTimeout in repeat().

  function repeat() {
    // Only update the grid if the user clicked within its bounds.
    if (inGridBoundaries(xPos, yPos)) {

      let [i, j] = getCellFromCoords(xPos, yPos); // row and column of cell

      // Only check and modify the cell if we haven't visited it yet.
      if (cellMap.has(i, j) === false) {
        const cellState = grid.getCellState(i, j); // State is either 1 or 0.
        // We add it to the visited set, then flip and draw the cell.
        if (cellState !== newCellState) {
          // If is not in the new state, we set it to the new state.
          grid.setCellState(i, j, newCellState);
          drawCell(i, j, newCellState); // Draw the new cell state on canvas.
        }
        // But if the cell is already in the new state, we don't touch it.
        // We just add it to the visited cells and move on.
        cellMap.set(i, j, newCellState);
      }
    }
    // Set a delayed call to repeat(), with the current holdDelay.
    timeoutID = setTimeout(repeat, holdDelay);
  }

  /* Clears the repeat() function that was queued by setTimeout. */
  canvas.addEventListener('mouseup', () => clearTimeout(timeoutID), {once: true});
  repeat(); // Call repeat() for the first time, to begin the loop.
}

loopGrid(); // After declaring everything, we call loopGrid() to run the grid.