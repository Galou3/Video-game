async function createHero() {
    const name = document.getElementById('heroName').value;
    const response = await fetch('/heroes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    const hero = await response.json();
    updateHeroList();
}

async function updateHeroList() {
    const response = await fetch('/heroes');
    const heroes = await response.json();
    const list = document.getElementById('heroList');
    list.innerHTML = heroes.map(hero => `
        <div class="hero-card">
            <h3>${hero.name}</h3>
            <p>Niveau: ${hero.level}</p>
        </div>
    `).join('');
}