# Overview
The goal of this project is to develop a custom web-based survey tool that allows researchers at Oregon State University (or other
organizations) to create interactive surveys featuring advanced data visualizations. Unlike existing platforms like Qualtrics, this tool supports dynamic elements such as zooming, panning, and selecting regions on visual assets like SVGs, allowing researchers to gather more nuanced and insightful data and responses. The platform emphasizes usability, accessibility, and data security, aiming to enhance both the researcher and participant experience while addressing the limitations of current survey tools.

Visit the landing page here: [https://seanmccoyosu.github.io/Interactive-Survey-Tools-For-Data-Visualizations/]

# Dependencies
To run this application on your local device, copy the repository and ensure the necessary dependencies are installed.

### Node
1. Go to the official Node.js website: https://nodejs.org
2. Download the LTS version for your operating system (Windows/macOS/Linux).
3. Run the installer and follow the prompts (accept default options).
4. Open the terminal in your IDE and verify the installation:
```
node -v
npm -v
```

### Docker (Desktop)
1. Go to https://www.docker.com/products/docker-desktop
2. Download Docker Desktop for your OS and run the installer.
3. After installation, launch Docker Desktop and sign in with a (new) Docker Hub account.
4. In the terminal, check for successful installation:
```
docker --version
docker compose version
```

# Quick Testing Guide for Your Local Machine
### Launching
Rename the file `.env` for later use.

Run `mv .env.local .env`.

Run `docker compose up --build` to run the application. This may take a while. Visit `http://localhost:5000/` and `http://localhost:8000/` to verify.

### Cleaning
Run `docker compose down` to clean up after you've tested.

# More Info
Please refer to this repository's wiki page for help:
https://github.com/seanmccoyOSU/Interactive-Survey-Tools-For-Data-Visualizations/wiki
