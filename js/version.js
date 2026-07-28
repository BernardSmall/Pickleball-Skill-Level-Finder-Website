// Displays the current release information from config.js.
dataReady.then(() => {
    const label = document.getElementById("versionLabel");
    if (label) {
        label.textContent = `${APP_CONFIG.name} ${APP_CONFIG.release} v${APP_CONFIG.version}`;
    }
});
