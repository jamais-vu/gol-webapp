/* jshint esversion: 6 */

import { getCellFromCoords, inGridBoundaries } from './canvas-helpers.js';
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

// TODO: Update this module comment as we make changes.
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
const ctx = canvas.getContext('2d'); // TODO: Don't need this here, can define in Drawing class

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

/* Create a new Drawing object with everything we just set up.
 * This object handles everything we do with the canvas. */
let drawing = new Drawing(canvas, ctx, grid, cellSize, xMax, yMax);

/* Initalize HTML elements, then draw gridlines and initial cell states. */
initializeHTMLElements(drawing);
drawing.initialCanvasDraw();


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
   whether the mouse is still held down. */
canvas.addEventListener('mouseout', () => {
  drawing.isMouseDown = false;
  drawing.cellMap.clear();
});
/* Prevent right-click on canvas from opening the context menu. */
canvas.addEventListener('contextmenu', function(event) {
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
pauseButton.addEventListener('click', pauseButtonHandler);

/* Moves to previous/next step so long as previous/next step button is held. */
previousStepButton.addEventListener('mousedown', clickAndHoldPreviousStepButton);
nextStepButton.addEventListener('mousedown', clickAndHoldNextStepButton);

/* Replaces the current grid with a randomly-populated grid. */
randomizeButton.addEventListener('click', () => {
  grid.randomize();
  drawing.drawGrid();
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
  drawing.drawGrid();
});
resetPatternButton.addEventListener('click', pause);

/* Sets current grid as start grid, then clears history and step count. */
setAsStartPatternButton.addEventListener('click', () => {
  grid.setAsStart();
 drawing.drawGrid();
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
  drawing.mouseDownButton = event.button;

  // TODO: Remove these when done
  // console.log('main.js: canvasMouseDownHandler called');
  // console.log('main.js: drawing.isMouseDown should be false: ${drawing.isMouseDown}');

  // xy-coordinate of mouse press, relative to canvas origin.
  const xPos = event.offsetX;
  const yPos = event.offsetY;

  // Only update the grid if the user clicked within its bounds.
  if (inGridBoundaries(xPos, yPos, drawing.xMax, drawing.yMax)) {
    // console.log('main.js: is in grid boundaries'); // TODO: Remove these when done
    // Get the row and column of the mouse press.
    let [i, j] = getCellFromCoords(xPos, yPos, drawing.xMax, drawing.yMax);

    // To support clicking, rather than just click-and-hold, we immediately
    // modify the state of the cell at the position of the mouse press, and
    // then add it to cellMap so holdDraw() knows we've already visited it.
    if (drawing.mouseDownButton === 0) {
      // If left-click, flip state of cell at mouse.
      flipCellAtCoords(xPos, yPos);
    } else if (drawing.mouseDownButton === 2) {
      // If right-click, set cell at mouse to dead.
      grid.setCellState(i, j, 0);
      drawing.drawCell(i, j, 0);
    }
    drawing.cellMap.set(i, j, grid.getCellState(i, j));
    drawing.isMouseDown = true;
    // console.log('main.js: drawing.isMouseDown should be true: ${drawing.isMouseDown}'); // TODO: Remove these when done
  }
}

/* Changes grid to pattern selected in the 'Select Pattern' dropdown menu. */
function changePatternFromDropdown() {
  const patternName = (document.getElementById("selectPattern")).value;
  grid.changePattern(presetPatterns[patternName].grid);
  drawing.drawGrid(grid);
}

/* "Pauses" drawing, by having loopGrid() do nothing but call itself again. */
function pause() {
  drawing.isPaused = true;
  pauseButton.innerHTML = 'Play';
}

/* "Unpauses" loopGrid(). */
function unpause() {
  drawing.isPaused = false;
  pauseButton.innerHTML = 'Pause';
}

/* Controls whether the grid automatically steps forward. */
function pauseButtonHandler() {
  if (drawing.isPaused) {
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
    clickAndHold(document, [pause], [previousStep, drawPreviousGridWrapper], 'keyup');
  } else if (key === 'ArrowRight') {
    event.preventDefault();
    clickAndHold(document, [pause], [nextStep, drawNextGridWrapper], 'keyup');
  } else if (key === 'Space') {
    event.preventDefault();
    pauseButtonHandler();
  }
}

/* Wrapper to pass args to `drawing.drawPreviousGrid()` without binding. */
function drawPreviousGridWrapper() {
  drawing.drawPreviousGrid();
}

/* Wrapper to pass args to `drawing.drawNextGrid()` without binding. */
function drawNextGridWrapper() {
  drawing.drawNextGrid();
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
  clickAndHold(previousStepButton, [pause], [previousStep, drawPreviousGridWrapper], 'mouseup');
}

/* Wrapper for calling clickAndHoldButton() with nextStep. */
function clickAndHoldNextStepButton() {
  clickAndHold(nextStepButton, [pause], [nextStep, drawNextGridWrapper], 'mouseup');
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
    drawing.drawGrid();
    stepInput.value = desiredStep;
  }
}

/* Changes the delay between steps to the value of the stepDelaySlider. */
function changeDelayBetweenSteps() {
  drawing.delay = stepDelaySlider.value;
  updateStepDelaySliderText(drawing.delay);
}

/* Flips state of the cell at the given canvas coordinates.
 * Note: This assumes the given coordinates are valid (ie, on the grid).
 */
function flipCellAtCoords(xPos, yPos) {
  // Get the row and column of the cell.
  let [i, j] = getCellFromCoords(xPos, yPos, drawing.xMax, drawing.yMax);
  grid.flipCell(i, j);
  drawing.drawCell(i, j, grid.getCellState(i, j)); // Draw the new cell state on canvas.
}

drawing.loopGrid(); // After declaring everything, we call loopGrid() to run the grid.