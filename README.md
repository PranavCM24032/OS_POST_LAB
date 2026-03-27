# Multi-Lift SCAN | Smart Elevator Optimizer 🏢

A modern web-based visualizer for the **SCAN (Disk Scheduling)** algorithm, extended to support multiple elevators with independent directions and distributed ETA-based dispatching.

## 🚀 Overview
This project demonstrates how the SCAN algorithm can be applied to elevator scheduling in a smart building environment. It features:
- **Dual-Lift Simulation**: Real-time animation of two elevators.
- **Distributed Dispatching**: A Python backend that calculates the optimal assignment based on ETA.
- **Dynamic Optimization**: Live sequence and distance tracking.
- **Performance Comparison**: Comparative chart showing system efficiency.

## 🛠️ Technology Stack
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism design), JavaScript (ES6+).
- **Backend**: Python 3.x (using standard `http.server`).
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) CDN.

## 📂 Project Structure
- `index.html`: The main dashboard UI.
- `script.js`: Frontend logic, animation, and API communication.
- `styles.css`: Premium UI styling and animations.
- `app.py`: The Python "Optimization Engine" that computes the SCAN sequences.

## 🏃 How to Run (Smart Start)

1. **Start the "Smart" Backend**:
   Simply run the backend script:
   ```powershell
   python app.py
   ```
2. **Auto-Magic**: 
   The backend will automatically:
   - Find a **random free port** on your system.
   - Launch your default browser.
   - Load the UI with the correct dynamic port already pre-configured.
   - *No manual port setting required!*

## 📂 Project Structure
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile.
- **Premium Aesthetics**: Vibrant gradients and smooth micro-animations.
- **Glassmorphism**: Modern frosted-glass effect for the dashboard cards.

---
*Created for OS Lab - Post Lab Assignment*
