# 🎮 GAME DESIGN DOCUMENT: DYING LIGHT
### *GameForge ’26 Hackathon Submission — USAR, GGSIPU (Elysian ’26)*

---

## 1. Executive Summary

| Project Detail | Information |
| :--- | :--- |
| **Game Title** | **DYING LIGHT: The Infinite Loop** |
| **Target Event** | **GameForge ’26** (24-Hour Game Jam / Hackathon — USAR, GGSIPU) |
| **Genre** | Precision Rhythm-Platformer / Mind-Bending Infinite Runner / Psychological Rage-Bait |
| **Platform & Tech** | Cross-Platform Web (Vanilla HTML5 Canvas, Web Audio API, ES6+ JS) |
| **Live Repository** | [axrnneedmiracles/dyinglightloop](https://github.com/axrnneedmiracles/dyinglightloop) |

**Elevator Pitch:** An intense, atmospheric circular platformer where physics, gravity, and perception warp across undulating neon rings. What begins as a rhythmic circular runner rapidly subverts player muscle memory with laser traps, silent control inversions, color-coded Russian roulette keys, crumbling floors, living heartbeat spikes, and lightless darkness.

---

## 2. Core Mechanics & Controls

* **Polar Physics Engine $(r, \theta)$**: Movement operates along a circular coordinate space. Centrifugal gravity pulls **radially outward**, keeping the runner grounded on the interior perimeter while jumps leap **radially inward** toward the core.
* **Variable Jump Arc**: Tap for micro-hops over ground spikes; hold for full-height clearance over orbiting buzzsaws.
* **Harmonic Ring Ripple**: Procedural multi-frequency sine waves continuously distort the ring geometry, creating an organic, undulating neon environment.
* **Unified Controls**:
  * **Run Left / Right**: `A` / `D` or `←` / `→` *(Mobile: On-screen neon arrows)*
  * **Inward Jump**: `Space`, `W`, or `↑` *(Mobile: Dedicated jump button)*
  * **Audio / Fullscreen**: Top-right HUD toggles or `M` / `F` keyboard shortcuts

---

## 3. Gameplay Loop & The "Abyss Dive"

```
[ Active Ring ] ──► [ Collect Key ] ──► [ Open Gate ] ──► [ Leap Inward ] ──► [ Abyss Dive Warp ]
```

1. **Survive & Seek**: Dodge moving saws and pop-up spikes on the outer active ring to locate the golden key.
2. **Ring Gate Severance**: Collecting the key cuts a radial gateway directly through the perimeter.
3. **The Abyss Dive Promotion**: Leaping through the gateway triggers a seamless $\approx 1.44\times$ scale expansion:
   * The outer ring expands into the background horizon.
   * The middle ring scales up to become the new playable ring.
   * A fresh core disc blossoms from the center with a vibrant palette shift and depth counter animation.
   * **Zero loading screens**: The player maintains continuous momentum across depths.

---

## 4. Level Progression & Rage-Bait Twists

| Depth | Mechanic / Phase | Player Challenge & Psychological Twist |
| :---: | :--- | :--- |
| **1–2** | *Awakening & Kinetic Flux* | Static spikes and counter-orbiting saws; calibrates inward jump timing. |
| **3** | *Laser Lockdown* | Converging lasers force player into 5 o'clock corner; slow-mo voice narrative; escape portal opens at 0.5s. |
| **4** | *The 8-Second Decay* | Introduces the 8s countdown meter; alarm audio & screen shake at 4s; zero-g float and floor collapse that drops player back to Depth 3 if time runs out. |
| **5–7** | *Ambush Spikes & Void Gaps* | Proximity-triggered spikes and sudden floor dropouts test twitch reflexes. |
| **8** | *Key Roulette (Order)* | Ring has 16 keys: **Green Key** advances to next level; **Red Key** deals damage. |
| **9** | *Key Roulette (Betrayal)* | Rules secretly flip! **Green Key** damages player; **Red Key** unlocks the gate. |
| **10** | *The Collapsing Void* | Ring sectors crumble into the abyss immediately behind you—hesitation is fatal. |
| **11** | *Hall of 3 Illusions* | Three doors appear: two are lethal illusions; only the radiant door leads forward. |
| **12** | *Living Heart Arena* | Ring pulses to an anatomical heartbeat ("lub-DUB"); jump timing keeps player safe in mid-air. |
| **13** | *Abyssal Darkness* | Total blackout; a 45° player flashlight beam reveals hazards only meters away. |
| **14+** | *Procedural Nightmare* | Algorithmic synthesis combining multiple mechanics simultaneously for infinite replay. |

---

## 5. Visual, Audio & Technical Design

* **Aesthetics & Lighting**: Deep abyssal backgrounds (`#0a0814`) with high-contrast electric neon glows (Cyan `#00f3ff`, Magenta `#ff0055`, Solar Gold `#ffe600`, Toxic Lime `#39ff14`) rendered via dual-pass Canvas bloom (`globalCompositeOperation = 'lighter'`).
* **Audio Engineering**: Custom Web Audio API synthesizer for zero-latency procedural jump/impact/heartbeat sound effects, paired with looping 20% background music and narrative audio tracks.
* **Interactive UI & Easter Egg**:
  * Dual-column cyberpunk menu with full settings modal (BGM/SFX sliders, screen shake toggle).
  * **"Motor Slice" Cursor-Eater**: Clicking the `⚠️ DON'T CLICK` mascot triggers a monster emoji jumpscare that devours the user's cursor (`cursor: none`), shakes the screen with crunching synths, and burps it back after 2.5 seconds.
* **Lightweight Architecture**: Zero external game engine bloat (under 200ms load time), stable 60+ FPS on all devices, and automated Vercel edge deployment.

---
*GameForge ’26 Hackathon Design Document — Built with HTML5 Canvas & Web Audio API.*
