User-interactive JavaScript web app of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).

Play with the web app at https://gol-webapp.jamaisvu.repl.co/.

## Instructions

Use the `Previous Step` and `Next Step` buttons, or left and right arrow keys, to move the grid state backward and forward.<br>
Hold these down to move through multiple states quickly, or use the `Go to step` input to skip to whichever step you want (moving 1000 or more steps at once may take a few seconds).

Control whether the grid moves forward automatically with the `Play` button, or by pressing the space bar.<br>
Use the `Speed` slider to choose the time (in milliseconds) between each step.

Click on the grid to flip the state of any cell. Click-and-hold with the left mouse button to draw live cells, or with the right mouse button to draw dead cells (note: click-and-hold with right click currently only works for physical buttons, not two-finger touch on touchpad).

`Clear` removes all live cells from the grid.

`Reset Pattern` returns the grid to its original state at step 0, and undoes any cells you drew with the mouse.

`Set as Start Pattern` sets the current grid as the original state. This allows you to draw on a grid, "save" it, and then modify it further, while easily undoing the further modifications with the `Reset Pattern` button.

`Randomize` randomly sets the state of all cells in the grid.

The `Select Pattern` dropdown allows you to choose from several well-known Game of Life patterns.

## Background

This was a fun project to get more familiar with JavaScript, especially with handling user interactions and how JavaScript and HTML work together to create the end product. I had never used the canvas before, and it was satisfying to figure out how to draw the grid fast enough that it feels responsive for the user. I like Game of Life, so adding user-interactive features, like mouse drawing, came naturally when I asked myself "What do I want to be able to do when I play with this?" (A fair amount of the time I spent on this was playing around on the grid and watching how different shapes I drew changed!)