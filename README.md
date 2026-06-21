*This is a submission for the [June Solstice Game Jam](https://dev.to/challenges/june-game-jam-2026-06-03)*

## What I Built
I built **Yötön Yö** (Nightless Night), an interactive 2D time-management game set during a traditional Finnish Midsummer (*Juhannus*). The sun never fully sets during the solstice in Finland, creating a beautiful and frantic twilight. 

As a player, you must survive the nightless night by managing multiple classic midsummer chores before the 3-minute timer runs out:
* **Stoke the Bonfire (*Kokko*):** Carry logs from the woodpile to fuel the fire. If the fire dies, the spirits leave and the game is lost.
* **Throw water (*Löyly*):** Keep the sauna heat in the ideal zone (60°C - 80°C). Don't throw too much water, or it will reset with a severe overheat penalty!
* **Swat Mosquitoes:** Buzzing pests swarm if left unchecked, draining your Cozy Meter.
* **Collect 7 Magical Flowers:** In Finnish folklore, gathering 7 magical flowers on Midsummer night brings dreams of your future love. Spot them in the twilight grass and gather all 7 to win.

## Video Demo
You can view the walkthrough video directly in the repository:
👉 **[nightless_night_video.mp4](https://github.com/qubelka/yoton-yo/blob/main/nightless_night_video.mp4)**

## Code and Live Demo
* **Repository:** [github.com/qubelka/yoton-yo](https://github.com/qubelka/yoton-yo)
* **Play Live Game:** **[qubelka.github.io/yoton-yo/](https://qubelka.github.io/yoton-yo/)**

## How I Built It
To keep compilation lightweight and deployment instant, I opted for a **Vanilla ES6 JavaScript** structure with **HTML5 `<canvas>`** drawing served via a local **Vite** bundler.
* **Vector Canvas Rendering:** Built custom vector paths and gradients to design a sunset sky blending into a shimmering lake, a traditional red cottage (*mökki*), a log sauna chimney, and dynamic fire particles.
* **Web Audio Synthesis:** To avoid external assets and ensure fast page loads, all sound effects (steam sizzles, mosquito swats, thumping logs, and magical chimes) are synthesized directly in the browser using the Web Audio API.
* **Modern UI:** Built a premium glassmorphic overlay using Vanilla CSS backdrop-filters, custom Google Fonts (`Outfit` and `Playfair Display`), and glowing responsive buttons.
* **GitHub Pages deployment:** Integrated a GitHub Actions workflow that automatically builds and deploys the game on push.

## Prize Category

### Best Google AI Usage
This game was built using **Antigravity**, a pair programming AI assistant designed by the **Google DeepMind** team. The AI co-designed the layout, helped mathematically center the woodpile logs, built the dynamic warning alerts stack, and synthesized the retro sound waveforms in JavaScript using the Web Audio API.