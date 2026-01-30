# PNG Mountain Specification

To support modern, high-quality terrain assets, the game now supports loading mountains from standard PNG files.

## File Format
*   **Format:** Standard PNG (Portable Network Graphics).
*   **Color Mode:** RGBA (Red, Green, Blue, Alpha).
*   **Compression:** Any standard PNG compression.

## Semantics
*   **Sky (Empty Space):**
    *   Defined by the **Alpha Channel**.
    *   Pixels with **Alpha = 0** (fully transparent) are treated as **Sky**.
    *   Projectiles can pass through Sky.
*   **Terrain (Solid Ground):**
    *   Pixels with **Alpha > 0** (non-transparent) are treated as **Solid Ground**.
    *   Recommended to use Alpha = 255 (fully opaque) for terrain to avoid visual artifacts, though the game logic treats any non-zero alpha as solid (or a threshold, e.g., > 10).
    *   The RGB color of the pixel is used directly for rendering the terrain. This allows for fully painted landscapes, textures, gradients, etc.

## Dimensions
*   **Width:** Variable. Recommended: 800px - 4096px.
*   **Height:** Variable. Recommended: 600px - 2160px.
*   The game engine will center the mountain horizontally on the canvas.
*   The game engine will align the bottom of the image with the bottom of the game canvas.

## Asset Guidelines
*   **Optimization:** Keep file sizes reasonable (e.g., < 2MB) for web loading.
*   **Style:** Realistic or stylized landscapes are encouraged.
*   **Collision:** Ensure the "surface" of the terrain is playable. Very jagged single-pixel spikes might be hard to navigate.

## Example
A 1920x1080 PNG where the top half is transparent (Alpha 0) and the bottom half is a painted rock texture (Alpha 255).
