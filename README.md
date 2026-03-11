# Daily Standup Wheel

A fun, interactive spin-the-wheel app for daily standup meetings. Randomly selects team members for their turn to speak.

## Features

- **Spin the Wheel** — Animated wheel with physics-based deceleration
- **Countdown Timer** — Configurable per-person timer with negative overflow
- **Total Elapsed Timer** — Tracks total meeting duration from first spin
- **Team Management** — Add, soft-remove, and permanently delete members
- **Import / Export** — Import from file or textbox, export to `.txt`
- **Privacy Mode** — Hide names on the wheel and list
- **Winner Handling** — Choose between popup confirmation or auto-remove modes
- **Persistent State** — All data saved to `localStorage`
- **Responsive Design** — Works on desktop and mobile
- **Funny Mode** — Disco neon lights, 8-bit pixel art UI, emoji wheel labels & whistle sound

## Getting Started

No build tools required. Just open `index.html` in a browser:

```
index.html
```

## Project Structure

```
daily-wheel/
├── index.html                  # Main HTML (single page)
├── README.md
├── assets/
│   ├── css/
│   │   ├── base.css            # Variables, reset, typography
│   │   ├── layout.css          # App container, sidebar, main area
│   │   ├── components.css      # Buttons, inputs, toggles, panels
│   │   ├── wheel.css           # Canvas, pointer, spin button
│   │   ├── members.css         # Member list & winner card
│   │   ├── modals.css          # Modal overlays & animations
│   │   ├── funny.css           # Funny mode: disco & 8-bit styles
│   │   └── responsive.css      # Media queries
│   └── js/
│       ├── config.js           # Constants & color palette
│       ├── state.js            # State management & localStorage
│       ├── timer.js            # Countdown & elapsed timers
│       ├── wheel.js            # Canvas rendering & physics
│       ├── members.js          # Team member CRUD & list rendering
│       ├── modals.js           # Winner determination & modal logic
│       ├── io.js               # Import/export functionality
│       ├── funny.js            # Funny mode: disco, whistle, emoji
│       └── app.js              # Entry point & event listeners
```

## Tech Stack

- **HTML5** for the wheel
- **Vanilla CSS** with CSS custom properties
- **Vanilla JavaScript**

## License

This project is open source.
