# AFL Footy Tipping 2027

Mobile-first browser prototype for Shrunk.

## Files
- `index.html`
- `styles.css`
- `app.js`
- `assets/shrunk_logo.png`
- `assets/Collingwood_Magpies_2023.stl`

## Local preview
Because the 3D STL is loaded with `fetch()`, open this app through a local web server rather than double-clicking `index.html`.

From this folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## GitHub Pages
Upload the contents of this folder to a GitHub repository and enable GitHub Pages from the repository root.

The current prototype uses external CDN scripts for Three.js and STLLoader.
