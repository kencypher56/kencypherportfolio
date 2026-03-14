# 🌌 Muhammad Waleed Amjad – 3D Interactive Portfolio

Welcome to the source code of my personal portfolio website. It features a **realistic, Interstellar‑style black hole**, a **dynamic 3D particle field**, and **interactive effects** that respond to mouse movement, clicks, and scrolling – all built with Three.js and Tailwind CSS.


## ✨ Features

- **🌀 Interstellar Black Hole**  
  A fully 3D black hole with a glowing accretion disk, photon rings, and gravitational‑lensing‑style lighting – it rotates smoothly and follows your mouse.

- **🌠 Dynamic Background Particles**  
  Thousands of particles (circles, triangles, squares, X shapes) float in a large sphere. They drift organically, **repel from the mouse**, and **burst outward on click** – just like space debris.

- **🖱️ Full Interactivity**  
  - **Mouse hover** – particles move away from the cursor.  
  - **Click** – creates an explosive force that scatters nearby particles and adds a colorful burst.  
  - **Scroll** – the black hole spins faster as you scroll down; the name fades out.

- **📜 Readable Text Overlay**  
  All sections except the hero have a **semi‑transparent, blurred background** so the black hole remains visible while text stays perfectly legible. The name has its own subtle background.

- **🌈 RGB Glowing Accents**  
  Section headings and icons pulse with RGB colors, adding a cyber‑aesthetic without overpowering the space theme.

- **📱 Fully Responsive**  
  Works on desktop, tablet, and mobile. Particle counts and sizes adapt for performance.

## 🛠️ Technologies Used

- **Backend**: Node.js + Express (simple static server)
- **3D Graphics**: Three.js (custom shaders, particles, and lighting)
- **Styling**: Tailwind CSS + custom CSS
- **Icons**: Font Awesome

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or later)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-portfolio.git
   cd your-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and visit `http://localhost:3000`

## 📂 Project Structure

```
portfolio/
├── public/
│   ├── index.html          # Main HTML file
│   ├── style.css           # Custom styles
│   ├── script.js           # Three.js magic (black hole + particles)
│   └── ... (any images)
├── server.js               # Express static server
├── package.json
└── README.md
```

## 🎨 Customization

- **Change personal info**: Edit the text inside `public/index.html` (name, experience, skills, etc.).
- **Tweak particle behavior**: In `script.js`, adjust `bgVelocities`, `REPULSION_STRENGTH`, or particle count.
- **Modify colors**: Look for `setHSL` calls in the particle generation section.
- **Black hole appearance**: Parameters like disk size, colors, and ring thickness are in the black hole section of `script.js`.

## 🤝 Credits

- Black hole physics inspiration: [Interstellar (2014)](https://www.imdb.com/title/tt0816692/)
- Three.js – [https://threejs.org](https://threejs.org)
- Tailwind CSS – [https://tailwindcss.com](https://tailwindcss.com)
- Font Awesome – [https://fontawesome.com](https://fontawesome.com)

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

**Made with 💻 and 🌌 by Muhammad Waleed Amjad**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/waleed-amjad-069520217)  
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kencypher56@gmail.com)
