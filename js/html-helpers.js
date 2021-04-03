/* jshint esversion: 6 */

import { getCellFromCoords } from './canvas-helpers.js';
import { presetPatterns } from './patterns.js';

/* Functions for modifying HTML elements.
 *
 * These populate HTML elements with initial values related to the grid and
 * canvas, and update those values as they change.
 */

/* Sets initial values of HTML elements on page load.
 *
 * In practice, we pass this an instance of the `Drawing` class, but any object
 * with the specified properties will work.
 */
export function initializeHTMLElements(initialValues) {
  updateStepDelaySliderText(initialValues.delay);
  populateSelectPattern();
  populateDebugInfoTable(
    initialValues.xMax,
    initialValues.yMax,
    initialValues.grid.rowCount,
    initialValues.grid.colCount,
    initialValues.cellSize
  );
  windowSizeCheck(initialValues.xMax, initialValues.yMax);
}

/* Populates child elements of the `debugInfoTable` element
 *
 * Unlike the mouse position, which is updated upon mouse move, the values here
 * are determined when the page is first loaded, and do not change thereafter.
 */
function populateDebugInfoTable(xMax, yMax, rows, columns, cellSize) {
  // xy-coordinates, in pixels, of the bottom-right.
  document.getElementById('canvasDimensions').innerHTML = `${xMax}, ${yMax}`;
  // Count of rows and columns in the grid.
  document.getElementById('gridDimensions').innerHTML = `${rows}, ${columns}`;
  // Size, in pixels, of each cell.
  document.getElementById('cellSize').innerHTML = `${cellSize}x${cellSize} px`;
  // Count of total number of cells in the grid.
  document.getElementById('cellCount').innerHTML = `${rows * columns}`;
  // xy size, in pixels, of the browser window.
  document.getElementById('windowDimensions')
    .innerHTML = `${window.innerWidth}, ${window.innerHeight}`;
}

/* Populates dropdown menu with preset patterns. */
function populateSelectPattern() {
  let selectPattern = document.getElementById("selectPattern");

  const patternNames = Object.keys(presetPatterns);
  for (let name of patternNames) {
    selectPattern.innerHTML += `<option value="${name}">${name}</option>`;
  }
}

/* Shows the xy and ij position of the mouse as it moves on the canvas.
 *
 * This information is displayed in the `debugInfoTable` element.
 */
export function updateCanvasMouseCoords(event, cellSize) {
  const mouseCell = getCellFromCoords(event.offsetX, event.offsetY, cellSize);
  document.getElementById('canvasMouseCoords')
    .innerHTML = `${event.offsetX}, ${event.offsetY}`;
  document.getElementById('canvasMouseCell')
    .innerHTML = `${mouseCell[0]}, ${mouseCell[1]}`;
}

/* Updates the text of pauseButton based on whether isPaused is true. */
export function updatePauseButton(isPaused) {
  if (isPaused == true) {
    document.getElementById('pauseButton').innerHTML = 'Play';
  } else if (isPaused === false) {
    document.getElementById('pauseButton').innerHTML = 'Pause';
  }
}

/* Updates the stepCountText HTML element to show current step count. */
export function updateStepCountText(stepCount) {
  document.getElementById('stepCountText').innerHTML = `${stepCount}`;
}

/* Updates the stepDelaySliderText HTML element to show current delay. */
export function updateStepDelaySliderText(delay) {
  document.getElementById('stepDelaySliderText').innerHTML = `${delay} ms`;
}

/* Shows the xy position of the mouse as it moves in the window.
 *
 * This information is displayed in the `debugInfoTable` element.
 */
export function updateWindowMouseCoords(event) {
  document.getElementById('windowMouseCoords')
    .innerHTML = `${event.clientX}, ${event.clientY}`;
}

/* If the window is not wide or tall enough, suggest the user resize it. */
function windowSizeCheck(width, height) {
if (width < 700 || height < 600) {
  document.getElementById('windowSizeAlert')
    .innerHTML = '(Best viewed in a larger window! <a href="">Reload</a>' +
                 ' the page after resizing.)';
  }
}
