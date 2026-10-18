# DYING LIGHT: The Infinite Loop

An intense, atmospheric infinite-loop game where speed, gravity, and perception warp across psychedelic undulating rings.

Built with HTML5 Canvas, Web Audio API, and procedural rippling geometry. It runs standalone in any browser with zero external dependencies and instant loading.

---

## 🎮 How to Play

### Running the Game
- **Directly in Browser:** Double-click [`index.html`](file:///c:/Users/aryan/OneDrive/Desktop/INFINITY%20LOOP%20GAME%20TRY/index.html) to open and play immediately in Chrome, Edge, Safari, or Firefox.
- **Via Local Server:** 
  ```bash
  python -m http.server 8080
  ```
  Then visit `http://localhost:8080`.

### Controls
| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Run Left (Clockwise)** | <kbd>A</kbd> or <kbd>&larr;</kbd> | Left on-screen arrow |
| **Run Right (Counter-Clockwise)** | <kbd>D</kbd> or <kbd>&rarr;</kbd> | Right on-screen arrow |
| **Jump Inward** | <kbd>Space</kbd>, <kbd>W</kbd>, or <kbd>&uarr;</kbd> | On-screen **JUMP** button |
| **Variable Jump Height** | Release Jump early to cut jump | Release Jump early |
| **Toggle Mute / Fullscreen** | Top-right HUD buttons | Top-right HUD buttons |

---

## 🕹️ Core Mechanics

1. **The Concentric Rings:**
   - **Active Ring (Outer Ring):** The player runs inside the circle along the active ring with feet on the outer perimeter and head pointing inward toward the center. Jumping leaps inward toward the center with natural centrifugal gravity.
   - **Middle Ring:** The next concentric ring inward.
   - **Core Center Disc:** Displays the current **Depth / Level** in retro pixel-art typography.
   - **Harmonic Wobble:** Multi-layer procedural sine wave distortion breathes and ripples organically across the rings.

2. **The Key & The Gate:**
   - A golden key floats on the active ring perimeter.
   - Collect the **KEY** to unlock the **GATE**.
   - Upon collection, the closed hatch bar opens into a radial passage cut cleanly through the active ring.
   - Entering the open gate propels the player into the inner ring and triggers the **Abyss Dive Transition**.

3. **The Abyss Promotion Transition:**
   - Rings expand smoothly by $\approx 1.44\times$.
   - The outer active ring expands to become the new fullscreen background color.
   - The middle ring expands to become the new playable active ring.
   - The core center disc expands to become the new middle ring.
   - A brand new core disc emerges at scale zero from the center with a fresh vibrant color.
   - The center Depth counter flips to the next level with a pop scale animation.

4. **Hazards & Health:**
   - Starts with **5 Pixel Hearts**.
   - **Static & Retracting Spikes:** Rhythmic spikes that rise and retract.
   - **Flying Saws:** Buzzsaws rapidly spinning and orbiting at fixed heights.
   - **Patrol Walkers:** Robotic patrol enemies pacing along sections of the ring.
   - Colliding with hazards causes 1 damage, screen shake, an elastic ring deformation shockwave, and temporary invincibility flicker.

---

## ⚡ Level Progression & Special Twists

- **Level 3 (Laser Pincer & Voice Hook):**
  - Sweeping vertical and horizontal energy lasers converge on the arena.
  - Audio playback automatically triggers for [`lvl3.mp4`](file:///c:/Users/aryan/OneDrive/Desktop/INFINITY%20LOOP%20GAME%20TRY/lvl3.mp4) (place this file directly in the root directory).
  - Dialogue text banners are hidden to let the voice-over audio play cleanly.
  - The emergency portal unlocks only at the final second beneath the player's feet.

- **Level 4 (Inverted Controls):**
  - Controls silently invert without on-screen clues (left moves right, right moves left).

- **Levels 5 & 6 (Rage-Bait Ambush Spikes & Void Collapses):**
  - Proximity-triggered ambush spikes and sudden sector dropouts test quick reflexes.

- **Level 8 (Key Roulette):**
  - Zero obstacles. The entire circumference is lined with 16 keys.
  - **Green Key:** Advances the player to Level 9.
  - **Red Key:** Deals damage to health.
  - Golden decoy keys bob innocently around the ring.

- **Level 9 (Inverted Key Roulette):**
  - The visual setup repeats, but the rules are deceptively swapped!
  - **Green Key:** Deals damage / kills the player.
  - **Red Key:** Unlocks the gateway to Level 10.

- **Level 10 (Disappearing Ring):**
  - Segments crumble and plunge into the abyss behind the player as they run.
  - Hesitating, stopping, or backtracking drops the player into the void.

- **Level 11 (Hall of Illusions):**
  - Three doors stand around the ring.
  - Two are fake illusions that shatter and deal damage upon contact.
  - Only the **radiantly glowing door** is real and leads forward.

- **Level 12 (Living Heart Arena):**
  - The entire arena dilates and contracts with a rhythmic biological double-thump ("lub-DUB").
  - Spikes emerge on every beat.
  - Jump timing is calibrated to let the player stay airborne and land cleanly as the spikes retract.

- **Level 13 (Abyssal Darkness):**
  - Complete pitch darkness.
  - A dynamic player-centered flashlight spotlight illuminates only the immediate floor.
  - Inward spikes lurk in the dark.

- **Level 14+ (Procedural Infinite Rage-Bait):**
  - Procedurally generated combinations of collapsing rings, ambush spikes, darkness spotlights, illusion doors, and pulsing hearts.
