// Drill data is loaded from data/drills.json by data-loader.js.

function displayDrills(priorities) {
    const container = document.getElementById("drillResults");
    container.innerHTML = "";

    priorities.forEach(([category]) => {
        const drill = drillLibrary[category];
        if (!drill) return;

        const card = document.createElement("article");
        card.className = "drill-card";
        card.innerHTML = `
            <span class="drill-time">${drill.time}</span>
            <h4>${drill.title}</h4>
            <p>${drill.description}</p>
        `;
        container.appendChild(card);
    });
}
