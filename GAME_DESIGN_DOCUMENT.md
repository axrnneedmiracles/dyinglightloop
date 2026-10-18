# 🎮 GAME DESIGN DOCUMENT (GDD)
## **DYING LIGHT: The Infinite Loop**
### *Submission for GameForge ’26 — USAR, GGSIPU (Elysian ’26)*

---

## 📌 Executive Summary

| Project Metadata | Details |
| :--- | :--- |
| **Game Title** | **DYING LIGHT: The Infinite Loop** |
| **Target Event** | **GameForge ’26** (24-Hour Game Jam / Hackathon) |
| **Organizer** | GameDev Guild Students Club (GDGSC), USAR, GGSIPU (East Delhi Campus) |
| **Platform** | Cross-Platform Web (Desktop & Mobile Touch) |
| **Engine / Tech Stack** | Vanilla HTML5 Canvas 2D, Web Audio API, Modern ES6+ JavaScript, CSS3 |
| **Live Web Deployment** | Vercel Serverless Edge Hosting |
| **GitHub Repository** | [axrnneedmiracles/dyinglightloop](https://github.com/axrnneedmiracles/dyinglightloop) |
| **Genre** | Precision Rhythm-Platformer / Mind-Bending Infinite Runner / Psychological Rage-Bait |

---

## 📖 Table of Contents
1. [Game Concept & Narrative Lore](#1-game-concept--narrative-lore)
2. [Core Game Mechanics & Physics Model](#2-core-game-mechanics--physics-model)
3. [Gameplay Loop & Progression Architecture](#3-gameplay-loop--progression-architecture)
4. [Detailed Level Breakdown & Rage-Bait Twists](#4-detailed-level-breakdown--rage-bait-twists)
5. [Visual & Aesthetic Design](#5-visual--aesthetic-design)
6. [Audio Engineering & Sound Design](#6-audio-engineering--sound-design)
7. [User Interface, Controls & Easter Eggs](#7-user-interface-controls--easter-eggs)
8. [Technical Architecture & Performance Optimization](#8-technical-architecture--performance-optimization)
9. [Hackathon Rubric Alignment & Innovation Matrix](#9-hackathon-rubric-alignment--innovation-matrix)

---

## 1. Game Concept & Narrative Lore

### 1.1 The Elevator Pitch
**DYING LIGHT: The Infinite Loop** is an atmospheric, adrenaline-fueled precision web platformer where physics, gravity, and perception warp across psychedelic concentric rings. What starts as a mesmerizing, hypnotic loop runner rapidly evolves into a self-aware, psychological trial that subverts player muscle memory through procedural traps, cognitive control inversions, crumbling terrain, biological arena pulses, and high-tension survival sequences.

### 1.2 Narrative & Thematic Premise
The player awakens as an anomalous energy spark—the **Last Lumen**—imprisoned within an infinite, hyper-dimensional simulation known as the **Abyssal Gyre**. 

The Gyre is not a static labyrinth; it is a sentient cybernetic organism that feeds on momentum and panic. The only way to survive is to plunge inward, diving through concentric dimensional layers by locating cryptographic energy keys that sever open ring gateways. However, as the Lumen descends deeper, the simulation fights back—mocking the runner, flipping the laws of directional inertia, fracturing the ground beneath their feet, plunging the world into lightless voids, and testing human reaction limits.

---

## 2. Core Game Mechanics & Physics Model

```
                    [ CORE CENTER DISC ]
                     (Depth Level Badge)
                              │
                    [ MIDDLE RING LAYER ]
                    (Next Inward Portal)
                              │
                    [ ACTIVE RING LAYER ]
            (Player runs inside with feet on outer edge)
                     ▲               ▲
              [Spike Hazards]     [Golden Key]
```

### 2.1 Concentric Ring Polar Coordinate System
Unlike traditional platformers operating on Cartesian axes $(x, y)$, **DYING LIGHT** is built upon a continuous **Polar Coordinate Physics Engine**:
- **Radial Position ($r$)**: Defines distance from the Gyre's center origin. The active layer rests at radius $R_{\text{active}}$.
- **Angular Position ($\theta \in [0, 2\pi)$)**: Dictates the runner's orbital position along the ring perimeter.
- **Centrifugal Gravity Vector**: Gravity pulls **radially outward**. The runner’s feet stay grounded along the interior of the outer perimeter, and their head points radially inward toward the core.
- **Cartesian Projection**: Every frame, the game translates polar coordinates to screen space via:
  $$x = x_{\text{center}} + r \cdot \cos(\theta)$$
  $$y = y_{\text{center}} + r \cdot \sin(\theta)$$

### 2.2 Movement Dynamics & Variable Jump
- **Inertial Running**: Smooth angular acceleration and deceleration with tuned rotational friction prevent twitchy or jerky stops:
  $$\omega_{t+1} = \omega_t \cdot \mu_{\text{friction}} + a_{\text{input}} \cdot \Delta t$$
- **Inward Leaping (Inverted Jump)**:
  - Pressing Jump applies an inward radial impulse ($v_r < 0$), launching the runner toward the center disc.
  - Centrifugal acceleration ($g_{\text{radial}} > 0$) counteracts this impulse, pulling the player smoothly back down onto the ring.
- **Variable Jump Arc**: Releasing the jump button early cuts the radial velocity dampening factor, rewarding precision micro-hops over low spikes while allowing full-height leaps over spinning saws.

### 2.3 The Harmonic Ring Ripple (Organic Wobble)
To eradicate sterile, static geometry, the rings breathe with multi-frequency procedural sine displacement:
$$R(\theta, t) = R_0 + A_1 \sin(4\theta + 2.4t) + A_2 \sin(7\theta - 1.8t)$$
This dynamic ripple gives the simulation a living, undulating liquid neon aesthetic that reacts to impact shockwaves.

---

## 3. Gameplay Loop & Progression Architecture

```
┌────────────────────────────────────────────────────────┐
│                   PRIMARY GAME LOOP                    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
             [ Traverse Active Outer Ring ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [ Evade Dynamic Hazards ]    [ Locate Golden Key ]
             │                           │
             └─────────────┬─────────────┘
                           ▼
               [ Collect Cryptographic Key ]
                           │
                           ▼
          [ Ring Gate Cuts Open Severance Portal ]
                           │
                           ▼
            [ Leap Inward Through Open Gate ]
                           │
                           ▼
         ★ [ THE SIGNATURE ABYSS DIVE PROMOTION ] ★
        • Outer ring expands to become fullscreen background
        • Middle ring scales up to become new active ring
        • Fresh core disc blossoms with vibrant palette shift
        • Depth Counter flips with pop-scale animation
                           │
                           ▼
            [ Next Level / Depth Unlocked ]
```

### 3.1 Abyss Dive Promotion Transition
The transition between levels avoids jarring screen-wipes or artificial loading screens. Instead, it utilizes a seamless **Scale-Invariance Warp**:
1. Upon jumping into the severed gate, camera zoom and concentric ring radius expand smoothly by an expansion factor of $\approx 1.44\times$.
2. The former outer ring dilates beyond the viewport, blending into the new ambient background.
3. The middle ring expands to exact pixel-scale to serve as the new playable active ring.
4. The center disc expands to form the new middle ring.
5. A brand new core ring spawns at scale zero, blossoming outwards with a vibrant chromatic shift and audio chime.
6. The player is already inside the new circle, maintaining continuous fluid control.

---

## 4. Detailed Level Breakdown & Rage-Bait Twists

| Depth / Level | Classification | Core Obstacle & Innovation | Psychological Factor |
| :---: | :---: | :--- | :--- |
| **Depth 1** | *The Awakening* | Static low-clearance spike teeth. | Baseline muscle memory calibration. |
| **Depth 2** | *Kinetic Flux* | Counter-orbiting buzzsaws and rhythmic pop-up spikes. | Spatial tracking and timing rhythm. |
| **Depth 3** | *Laser Lockdown* | Sweeping vertical & horizontal laser beams trap the player in bottom-right corner; slow-mo countdown; voice narration; portal opens at 0.5s. | High-tension panic and fake-death anticipation. |
| **Depth 4** | *Cognitive Inversion* | Controls silently swap (Left $\to$ Right, Right $\to$ Left) without on-screen warning text. | Cognitive dissonance & neuro-plastic adaptation. |
| **Depth 5** | *Ambush Ambition* | Proximity-triggered spring spikes burst outward 60ms before player arrival. | Subversion of safe sprinting habits. |
| **Depth 6** | *Void Fractures* | Sudden fake floor segments drop out; requires reactionary micro-jumps. | Distrust of environment stability. |
| **Depth 7** | *Twin Overdrive* | Double-speed orbit saws paired with alternating high-low hurdles. | Precision twitch reflex testing. |
| **Depth 8** | *Russian Roulette (Order)* | Ring has 0 hazards, but 16 keys. **Green Key** unlocks exit; **Red Key** damages health. | Suspenseful decision-making. |
| **Depth 9** | *Russian Roulette (Chaos)* | Same key circle, but rules are deceptively swapped: **Green Key** kills; **Red Key** is salvation! | Betrayal of established trust. |
| **Depth 10** | *The Collapsing Void* | Ring sectors crumble into the black abyss immediately behind the runner. | Relentless forward momentum—hesitation is death. |
| **Depth 11** | *Hall of 3 Illusions* | 3 gate doors appear simultaneously. Two are fatal mirages; only the radiant door is authentic. | Observation of subtle visual cues under pressure. |
| **Depth 12** | *Living Heart Arena* | Ring dilates and pulses with a rhythmic anatomical heartbeat ("lub-DUB"). Lethal spikes protrude on every beat; player must time hangtime. | Rhythm synchronization with biological audio cues. |
| **Depth 13** | *Abyssal Darkness* | Complete blackout. Player possesses a 45° ray-cast flashlight beam revealing hazards only when meters away. | Claustrophobia and audio-visual spatial memory. |
| **Depth 14+** | *Procedural Nightmare* | Algorithmic synthesis combining multiple twists simultaneously (e.g., Collapsing Ring + Inverted Controls + Heartbeat Spikes). | Infinite high-skill replayability. |

---

## 5. Visual & Aesthetic Design

### 5.1 Cyberpunk Neon-Dark Art Direction
The visual presentation fuses the sleek, high-contrast aesthetics of *Tron*, *Geometry Dash*, and retro synthwave arcade cabinets:
- **Background Atmosphere**: Deep abyssal gradients (`#0a0814` to `#040308`) with a dynamic ambient starfield and subtle vignette.
- **Neon Color Harmonies**: High-vibrancy chromatic accents tailored per level:
  - *Cyan / Electric Teal* (`#00f3ff`)
  - *Laser Magenta / Synth Red* (`#ff0055`)
  - *Solar Amber / Gold* (`#ffe600`)
  - *Toxic Lime / Radioactive Green* (`#39ff14`)
  - *Abyssal Glitch Violet* (`#bf00ff`)
- **Multi-Pass Bloom Rendering**:
  - Elements render across dual-pass composite states using HTML5 Canvas `globalCompositeOperation = 'lighter'` and multi-radius `shadowBlur` (4px sharp core, 18px soft aura) to generate authentic CRT bloom without frame rate drops.

### 5.2 Micro-Interactions & Particle Dynamics
- **Velocity Streaks**: Player leaves trailing chromatic ghost particles that stretch proportionally to angular velocity.
- **Ring Severance Shards**: When the key opens the gate, the active ring fractures into physical debris particles that burst radially outwards.
- **Impact Shockwaves & Chromatic Shake**: Taking damage triggers an instant screen rumble, viewport chromatic displacement, and an elastic radial ripple across the active ring.

---

## 6. Audio Engineering & Sound Design

### 6.1 Low-Latency Procedural Synthesizer (Web Audio API)
To achieve sub-millisecond responsiveness without audio buffer lag, the game features a custom procedural sound synthesis engine built with pure JavaScript `AudioContext`:
- **Inward Jump**: Rapid exponential frequency modulation (FM) sine chirp (220 Hz $\to$ 880 Hz over 90ms).
- **Key Discovery**: Harmonic arpeggiated tri-tone chime with shimmering high-order bandpass resonance.
- **Gate Severance**: Low-frequency resonant pulse accompanied by white-noise burst filtered to simulate mechanical release.
- **Hazard Collision**: Heavy square-wave sub-drop mixed with randomized noise bursts for impactful crunch.
- **Living Heartbeat (Depth 12)**: Dual-stage low-pass filtered sub-bass kick simulating the biological *lub-DUB* cardiac cycle.

### 6.2 Atmospheric Media Integration
- **Cinematic Prologue (`mainintro.mp4`)**: High-definition opening cutscene featuring an automatic CSS3/Canvas opacity cross-fade into the main menu at exactly 0:16 seconds.
- **Continuous Looping BGM (`bgm.mp4` / `bgm.m4a`)**: High-energy synthwave soundtrack mixed to a persistent 20% background volume with error-resistant audio fallback listeners.
- **Level 3 Narrative Voiceover (`lvl3.mp4` / `lvl3.mp4.mp3`)**: Seamless diegetic speech track triggered during the Level 3 laser standoff.

---

## 7. User Interface, Controls & Easter Eggs

### 7.1 Split Cybernetic Menu UI
The start menu departs from boring centered button columns, featuring an interactive 2-column cyberpunk split display:
- **Right Column**: High-tech translucent glassmorphic console with **PLAY**, **SETTINGS**, and status telemetry.
- **Settings Modal**: Dynamic control over BGM Volume, SFX Volume, Screen Shake toggle, and On-Screen Touch Controls toggle.
- **Left Column — The Interactive Guardian**: A massive, beautifully animated Canvas render of the protagonist player character, accompanied by a pulsing warning tag: `⚠️ DON'T CLICK`.

### 7.2 The "Motor Slice" Cursor-Eater Jumpscare
Tapping or clicking the forbidden character triggers an elaborate interactive easter egg:
1. The character's eyes widen, flashing an enraged monster demon emoji (😡 / 👹).
2. The user's system mouse cursor is instantly devoured (`cursor: none !important`).
3. An animated cartoon monster rushes across the screen, snapping its fangs down on the exact mouse coordinate.
4. Realistic crunching chewing sound synths and violent viewport screen-shake play.
5. After 2.5 seconds of chewing in the dark, a comic burp sound releases the cursor back to the user.

### 7.3 Multi-Platform Input Mapping

| Device | Action | Primary Key | Secondary / Mobile |
| :--- | :--- | :--- | :--- |
| **Desktop** | Run Clockwise (Left) | <kbd>A</kbd> | <kbd>← Left Arrow</kbd> |
| **Desktop** | Run Counter-Clockwise (Right) | <kbd>D</kbd> | <kbd>→ Right Arrow</kbd> |
| **Desktop** | Inward Jump | <kbd>Space</kbd> | <kbd>W</kbd> or <kbd>↑ Up Arrow</kbd> |
| **Desktop** | Mute Audio / Fullscreen | HUD Icon Click | <kbd>M</kbd> / <kbd>F</kbd> Shortcuts |
| **Mobile / Touch** | Run Direction | Virtual Left Arrow | Virtual Right Arrow |
| **Mobile / Touch** | Jump Inward | Virtual Neon Jump Pad | Direct Screen Tap |

---

## 8. Technical Architecture & Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                         │
├─────────────────────────────────────────────────────────────┤
│  [index.html]   Semantic DOM, HUD Overlay, Settings Modal   │
│  [index.css]    GPU-Accelerated Flexbox/Grid, Animations    │
│  [game.js]      Pure ES6 Engine Loop (requestAnimationFrame) │
├─────────────────────────────────────────────────────────────┤
│  [AudioEngine]  Web Audio API Node Graph + Dual Fallback    │
│  [Physics]      Polar (r, θ) Integrator & Collision Matrix  │
│  [Renderer]     Multi-layer Dual-Pass 60+ FPS Canvas 2D     │
└─────────────────────────────────────────────────────────────┘
```

### 8.1 Zero-Dependency Lightweight Footprint
- **No Heavy Framework Overhead**: Unlike Unity WebGL builds which require 30MB+ WebAssembly downloads and lengthy splash load times, **DYING LIGHT** boots in **< 200 milliseconds** on any modern device.
- **Memory Footprint**: Stabilized under 35 MB of RAM through object pooling (reusable particle structures without garbage-collection hitching).

### 8.2 Sub-Pixel Polar Collision Detection
Collision between the player and hazards occurs directly in angular arc space:
$$\Delta\theta = |\theta_{\text{player}} - \theta_{\text{hazard}}| \pmod{2\pi}$$
$$\text{Hit} \iff \Delta\theta < \theta_{\text{threshold}} \quad \text{AND} \quad r_{\text{player}} \approx r_{\text{hazard}}$$
This ensures $100\%$ mathematical precision regardless of screen resolution or canvas aspect ratio.

### 8.3 Vercel Edge Hosting Configuration
The project includes a custom `vercel.json` containing HTTP response headers optimized for static streaming:
```json
{
  "headers": [
    {
      "source": "/(.*)\\.(mp4|m4a|mp3)",
      "headers": [
        { "key": "Accept-Ranges", "value": "bytes" },
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 9. Hackathon Rubric Alignment & Innovation Matrix

| Judging Dimension | How DYING LIGHT Achieves Maximum Marks |
| :--- | :--- |
| **Theme Incorporation & Originality** | Subverts conventional flat platformers into an infinite circular dimension with dynamic psychological twists and mathematical polar physics. |
| **Gameplay & Mechanics** | Fluid running and inward jumping paired with the seamless Abyss Dive level promotion; progressive escalation across 14+ distinct mechanic phases. |
| **Technical Polish & Execution** | 60+ FPS zero-dependency Canvas architecture, real-time procedural Web Audio synth generation, edge-optimized video streaming, and seamless mobile touch support. |
| **Visual & Audio Design** | Cohesive cyberpunk synthwave aesthetic, multi-pass bloom glow, living heart rhythm synchronization, and high-production intro sequence. |
| **Surprise & Fun Factor** | The Motor Slice cursor-eater jumpscare, Russian roulette key traps, sudden control inversions, and flashlight darkness trials keep judges entertained and engaged. |

---

*Authored for the GameForge ’26 Hackathon jury presentation. Built with passion for gaming innovation.*
