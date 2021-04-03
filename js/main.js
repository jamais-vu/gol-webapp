/* jshint esversion: 6 */

import { getCellFromCoords, inGridBoundaries } from './canvas-helpers.js';
import { clickAndHold } from './clickAndHold.js';
import { presetPatterns } from './patterns.js';
import { ToroidalGameOfLifeGrid } from './class.js';

import {
  initializeHTMLElements,
  updateCanvasMouseCoords,
  updateStepCountText,
  updateStepDelaySliderText,
  updateWindowMouseCoords,
} from './html-helpers.js';

import { Drawing } from './drawing.js';

/* This file contains logic for drawing the grid on canvas, and for handling
 * user interactions via button or mouse press.
 *
 * Structure (in order):
 * 1) Set up the canvas and create a grid object based on canvas size.
 * 2) Create a Drawing object for handling all canvas drawing.
 * 3) Add event listeners to buttons and other elements, and declare
 * handlers for those events.
 */

// Set up canvas
const canvas = document.querySelector('.myCanvas');

/* We set the canvas size to be slightly less than the viewport size, since
 * we don't want to user to have to scroll horizontally to see the full grid. */
canvas.width = (window.innerWidth * 0.95); // viewport width
canvas.height = (window.innerHeight * 0.95); // viewport height

/* Using a preset cell size, we calculate the maximum number of rows and columns
 * that will fit in the canvas, and then create a grid with those numbers. */
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

/* Create a new Drawing object with everything we just set up.
 * This object handles everything we do with the canvas. */
let drawing = new Drawing(canvas, grid, cellSize, xMax, yMax);

/* Initalize HTML elements, then draw gridlines and initial cell states. */
initializeHTMLElements(drawing);
drawing.initialCanvasDraw();


/* UI logic
 *
 * First we declare functions to handle various browser events.
 * Then we assign these functions to their respective events.
 *
 * Some functions are declared anonymously in the actual `addEventListener()`
 * call, either for clarity or due to the shortness of the function itself.
 */

/* Event handlers */

/* Function bindings to pass drawing and grid methods without losing context. */
const boundDrawPreviousGrid = drawing.drawPreviousGrid.bind(drawing);
const boundDrawNextGrid = drawing.drawNextGrid.bind(drawing);
const boundPreviousStep = grid.previousStep.bind(grid);
const boundNextStep = grid.nextStep.bind(grid);
const pause = drawing.pause.bind(drawing);
const unpause = drawing.unpause.bind(drawing);

/* Changes the delay between steps to the value of the stepDelaySlider. */
function changeDelayBetweenSteps() {
  drawing.delay = stepDelaySlider.value;
  updateStepDelaySliderText(drawing.delay);
}

/* Changes grid to pattern selected in the 'Select Pattern' dropdown menu. */
function changePatternFromDropdown() {
  const patternName = (document.getElementById("selectPattern")).value;
  grid.changePattern(presetPatterns[patternName].grid);
  drawing.drawGrid(grid);
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
    clickAndHold(document, [pause], [boundPreviousStep, boundDrawPreviousGrid], 'keyup');
  } else if (key === 'ArrowRight') {
    event.preventDefault();
    clickAndHold(document, [pause], [boundNextStep, boundDrawNextGrid], 'keyup');
  } else if (key === 'Space') {
    event.preventDefault();
    drawing.togglePause();
  }
}

/* Transitions the grid to the user-inputted step, and then draws the grid. */
function stepInputHandler() {
  const desiredStep = parseInt(stepInput.value); // stepInput is the input box
  if ( !isNaN(desiredStep) ) {
    // Empty input box will raise NaN warning, so we check before proceeding.
    grid.goToStep(desiredStep);
    drawing.drawGrid();
    stepInput.value = desiredStep;
  }
}

/* Event Listeners
 *
 * Set up event listeners for webpage elements. Ordered alphabetically.
 * TODO: This looks messy to me. Would like to find a better way to organize.
 * Maybe place in their own module.
 */

/* Displays xy and ij coordinates of the mouse as it moves over the canvas.
 * The xy-coordinate is relative to the upper-left of the canavas.
 * The ij-coordinate is the row and column of the grid. */
canvas.addEventListener('mousemove', (event) => {
  updateCanvasMouseCoords(event, drawing.cellSize);
});
/* Flips the state of the cell at the position of the mouse click. */
canvas.addEventListener('mousedown', (event) => {
  drawing.canvasMouseDownHandler(event);
});
/* While the mouse is held down, any cell under it is set to alive. */
canvas.addEventListener('mousemove', (event) => {
  if (drawing.isMouseDown) {
    drawing.holdDraw(event);
  }
});
/* Sets isMouseDown to false, which stops click-and-hold drawing of cells. */
canvas.addEventListener('mouseup', () => {
  drawing.isMouseDown = false;
  drawing.cellMap.clear(); // We empty the map of visited cells when mouse is lifted.
});
/* Sets isMouseDown to false if the mouse moves out of the canvas, regardless of
 * whether the mouse is still held down. */
canvas.addEventListener('mouseout', () => {
  drawing.isMouseDown = false;
  drawing.cellMap.clear();
});
/* Prevent right-click on canvas from opening the context menu. */
canvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

/* Clears the canvas. Sets all cells to 0, clears history, resets step count. */
clearCanvasButton.addEventListener('click', () => {
  grid.clear();
  drawing.drawGrid();
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
pauseButton.addEventListener('click', () => drawing.togglePause());

/* Moves to previous/next step so long as previous/next step button is held. */
previousStepButton.addEventListener('mousedown', () => {
  clickAndHold(previousStepButton, [pause], [boundPreviousStep, boundDrawPreviousGrid], 'mouseup');
});
nextStepButton.addEventListener('mousedown', () => {
  clickAndHold(nextStepButton, [pause], [boundNextStep, boundDrawNextGrid], 'mouseup');
});

/* Replaces the current grid with a randomly-populated grid. */
randomizeButton.addEventListener('click', () => {
  grid.randomize();
  drawing.drawGrid();
});
randomizeButton.addEventListener('click', pause);

/* Resets the displayed grid to the state it was in when the page was loaded,
 * prior to any user modifications.
 *
 * Note: This is different from its state at step 0, since the user may modify
 * the grid at any step, including step 0. */
resetPatternButton.addEventListener('click', () => {
  grid.reset();
  drawing.drawGrid();
});
resetPatternButton.addEventListener('click', pause);

/* Sets current grid as start grid, then clears history and step count. */
setAsStartPatternButton.addEventListener('click', () => {
  grid.setAsStart();
 drawing.drawGrid();
});
setAsStartPatternButton.addEventListener('click', pause);

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


drawing.loopGrid(); // After declaring everything, we call loopGrid() to run the grid.