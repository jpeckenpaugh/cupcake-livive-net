# 2048 Cupcakes

An offline browser game based on 2048. Merge matching cupcakes to reach the 2048 tile, White Chocolate Peppermint.

## Play locally

Clone or download this repository and open `index.html` in a modern browser. Keep the HTML, CSS, JavaScript, and `assets/` folder together. The game runs without a server, installation, or internet connection.

Use the arrow keys or the on-screen arrow buttons to slide the tiles. Two matching cupcakes merge into the next tier and add the resulting cupcake's calories to your score. For example, two Vanilla Birthday tiles (2) make a Bubblegum Pink tile (4) and earn 250 kcal. Select **New game** to reset the board and score.

Use the **Cupcake style** menu to switch between **Illustrated** and **Photorealistic** during play. Both styles work offline.

## Project files

- `index.html` defines the board and controls.
- `game.js` handles movement, scoring, and tile rendering.
- `style.css` contains the layout and illustrations for all 11 cupcake tiers.
- `assets/cupcake-photos.png` contains the photorealistic artwork for all 11 tiers.

Cupcake calorie values are inspired by [2048 Cupcakes](https://cupcake2048.github.io/2048-CUPCAKES/).
