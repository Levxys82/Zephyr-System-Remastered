const allVersions = [
    // 1.21 Serisi
    "1.21.12", "1.21.11", "1.21.10", "1.21.9", "1.21.8", "1.21.7", "1.21.6", "1.21.5", "1.21.4", "1.21.3", "1.21.2", "1.21.1", "1.21", 
    // 1.20 Serisi
    "1.20.6", "1.20.5", "1.20.4", "1.20.3", "1.20.2", "1.20.1", "1.20",
    // 1.19 Serisi
    "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19",
    // 1.18 Serisi
    "1.18.2", "1.18.1", "1.18",
    // 1.17 Serisi
    "1.17.1", "1.17",
    // 1.16 Serisi
    "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16",
    // Klasik ve Alt Sürümler
    "1.15.2", "1.15.1", "1.15",
    "1.14.4", "1.14.3", "1.14.2", "1.14.1", "1.14",
    "1.13.2", "1.13.1", "1.13",
    "1.12.2", "1.12.1", "1.12",
    "1.11.2", "1.11.1", "1.11",
    "1.10.2", "1.10.1", "1.10",
    "1.9.4", "1.9.3", "1.9.2", "1.9.1", "1.9",
    "1.8.9", "1.8.8", "1.8.7", "1.8.6", "1.8.5", "1.8.4", "1.8.3", "1.8.2", "1.8.1", "1.8",
    "1.7.10", "1.7.9", "1.7.8", "1.7.7", "1.7.6", "1.7.5", "1.7.4", "1.7.3", "1.7.2",
    "1.6.4", "1.6.2", "1.6.1",
    "1.5.2", "1.5.1",
    "1.4.7", "1.4.6", "1.4.5", "1.4.4", "1.4.2",
    "1.3.2", "1.3.1",
    "1.2.5", "1.2.4", "1.2.3", "1.2.2", "1.2.1",
    "1.1", "1.0"
];
let currentType = 'mod', currentOffset = 0, selectedFilters = {};
let collapsedGroups = new Set();
let projectVersions = [];

const categoryIcons = {
    "adventure": "/icons/compass.png", "cursed": "/icons/spider_eye.png", "decoration": "/icons/painting.png",
    "economy": "/icons/gold_ingot.png", "equipment": "/icons/iron_sword.png", "food": "/icons/bread.png",
    "game mechanics": "/icons/redstone.png", "library": "/icons/book.png", "magic": "/icons/enchanted_book.png",
    "management": "/icons/chest.png", "minigame": "/icons/slime_ball.png", "mobs": "/icons/zombie_head.png",
    "optimization": "/icons/clock.png", "social": "/icons/player_head.png", "storage": "/icons/barrel.png",
    "technology": "/icons/furnace.png", "transportation": "/icons/minecart.png", "utility": "/icons/crafting_table.png",
    "world generation": "/icons/grass_block.png", "combat": "/icons/iron_sword.png", "realistic": "/icons/grass_block.png",
    "simplistic": "/icons/stick.png", "themed": "/icons/map.png", "tweaks": "/icons/shears.png",
    "vanilla like": "/icons/grass_block.png", "audio": "/icons/note_block.png", "blocks": "/icons/cobblestone.png",
    "entities": "/icons/pig_spawn_egg.png", "environment": "/icons/oak_sapling.png", "fonts": "/icons/paper.png",
    "gui": "/icons/inventory.png", "items": "/icons/apple.png", "locale": "/icons/writable_book.png"
};

const icons = { loaders: "/icons/anvil.png", categories: "/icons/chest.png", versions: "/icons/clock.png" };
const filterConfig = {
    mod: { loaders: ["Fabric", "Forge", "NeoForge", "Quilt"], categories: ["Adventure","Cursed","Decoration","Economy","Equipment","Food","Game Mechanics","Library","Magic","Management","Mobs","Optimization","Storage","Technology","World Generation"] },
    resourcepack: { categories: ["Combat","Cursed","Decoration","Realistic","Simplistic","Themed","Tweaks","Utility","Vanilla Like"] },
    plugin: { categories: ["Adventure","Cursed","Decoration","Economy","Equipment","Food","Game Mechanics","Library","Magic","Management","Mobs","Optimization","Social","Storage","Technology","Transportation","Utility","World Generation"] },
    datapack: { categories: ["Adventure","Cursed","Decoration","Economy","Equipment","Food","Game Mechanics","Library","Magic","Management","Mobs","Optimization","Social","Storage","Technology","Transportation","Utility","World Generation"] },
    shader: { categories: ["Realistic","Simplistic","Themed","Tweaks","Utility"] },
    modpack: { categories: ["Adventure","Cursed","Decoration","Economy","Equipment","Food","Game Mechanics","Library","Magic","Management","Mobs","Optimization","Social","Storage","Technology","Transportation","Utility","World Generation"] }
};

window.toggleGroup = (key) => {
    const content = document.getElementById(`content-${key}`);
    const arrow = document.getElementById(`arrow-${key}`);
    if (collapsedGroups.has(key)) {
        collapsedGroups.delete(key);
        content.classList.remove('hidden');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        collapsedGroups.add(key);
        content.classList.add('hidden');
        arrow.style.transform = 'rotate(-90deg)';
    }
};

window.renderFilters = () => {
    const container = document.getElementById('filter-container');
    if (!container) return;
    const config = filterConfig[currentType] || filterConfig.mod;
    let html = `<div class="mb-6"><div class="flex justify-between items-center cursor-pointer py-2 text-xs font-black text-slate-400 uppercase tracking-widest" onclick="toggleGroup('versions')">Game Version <span id="arrow-versions" class="transition-transform" style="transform:rotate(${collapsedGroups.has('versions')?'-90':'0'}deg)">▼</span></div><div id="content-versions" class="space-y-1 mt-2 max-h-48 overflow-y-auto pr-2 ${collapsedGroups.has('versions')?'hidden':''}">${allVersions.map(v => `<div class="filter-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${selectedFilters.versions?.includes(v)?'active bg-blue-100 text-blue-700 font-bold':''}" onclick="toggleFilter('versions', '${v}', this)"><img src="${icons.versions}" class="w-4 h-4 pixelated">${v}</div>`).join('')}</div></div>`;
    Object.keys(config).forEach(key => {
        const items = config[key];
        html += `<div class="mb-6"><div class="flex justify-between items-center cursor-pointer py-2 text-xs font-black text-slate-400 uppercase tracking-widest" onclick="toggleGroup('${key}')">${key} <span id="arrow-${key}" class="transition-transform" style="transform:rotate(${collapsedGroups.has(key)?'-90':'0'}deg)">▼</span></div><div id="content-${key}" class="space-y-1 mt-2 ${collapsedGroups.has(key)?'hidden':''}">${items.map(f => `<div class="filter-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${selectedFilters[key]?.includes(f.toLowerCase())?'active bg-blue-100 text-blue-700 font-bold':''}" onclick="toggleFilter('${key}', '${f.toLowerCase()}', this)"><img src="${categoryIcons[f.toLowerCase()] || icons[key] || icons.categories}" class="w-4 h-4 pixelated">${f}</div>`).join('')}</div></div>`;
    });
    container.innerHTML = html;
};

window.toggleFilter = (key, value, el) => {
    if (!selectedFilters[key]) selectedFilters[key] = [];
    const idx = selectedFilters[key].indexOf(value);
    if (idx > -1) { selectedFilters[key].splice(idx, 1); }
    else { selectedFilters[key].push(value); }
    currentOffset = 0;
    renderFilters();
    fetchData();
};

window.fetchData = async () => {
    const grid = document.getElementById('mod-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full py-20 text-center opacity-50 font-black animate-pulse text-slate-400">Syncing Zephyr Core...</div>';
    const search = document.getElementById('global-search')?.value || '';
    const sort = document.getElementById('sort-select')?.value || 'relevance';
    let facets = [`["project_type:${currentType}"]`];
    Object.keys(selectedFilters).forEach(key => {
        if (selectedFilters[key] && selectedFilters[key].length > 0) {
            const prefix = (key === 'versions') ? 'versions' : 'categories';
            facets.push(`[${selectedFilters[key].map(v => `"${prefix}:${v}"`).join(',')}]`);
        }
    });
    const url = `https://api.modrinth.com/v2/search?query=${encodeURIComponent(search.trim())}&facets=${encodeURIComponent(`[${facets.join(',')}]`)}&index=${sort}&limit=12&offset=${currentOffset}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.hits) {
            document.getElementById('total-results').innerText = data.total_hits.toLocaleString();
            grid.innerHTML = data.hits.map(m => `<div class="bg-white border border-slate-100 rounded-[32px] overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-blue-200 transition-all group shadow-sm hover:shadow-xl" onclick="openDetail('${m.project_id}')"><div class="h-24 relative bg-slate-50 flex items-end px-6"><img src="${m.icon_url}" class="w-14 h-14 rounded-2xl border-4 border-white bg-white shadow-xl -mb-7 relative z-10" onerror="this.src='https://via.placeholder.com/50'"></div><div class="p-6 pt-12"><h3 class="font-black text-slate-800 line-clamp-1 mb-1 text-lg">${m.title}</h3><p class="text-xs text-slate-400 font-semibold line-clamp-2 h-10 mb-4">${m.description || 'No description available'}</p><div class="pt-4 border-t border-slate-50 flex justify-between items-center"><span class="text-[10px] font-black text-slate-300">⬇ ${(m.downloads || 0).toLocaleString()}</span><span class="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-1 rounded-lg uppercase">${currentType}</span></div></div></div>`).join('');
            const totalPages = Math.ceil(data.total_hits / 12);
            const currentPage = Math.floor(currentOffset / 12) + 1;
            document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages}`;
            document.getElementById('prev-page').disabled = currentOffset === 0;
            document.getElementById('next-page').disabled = currentOffset + 12 >= data.total_hits;
        }
    } catch(e) { console.error("Sync error:", e); }
};

window.openDetail = async (id) => {
    const panel = document.getElementById('detail-panel');
    if (!panel) return;
    panel.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('detail-body').innerHTML = '<div class="max-w-4xl mx-auto py-20 text-center font-black opacity-20">LOADING ASSET...</div>';
    try {
        const [p, versions] = await Promise.all([
            fetch(`https://api.modrinth.com/v2/project/${id}`).then(r => r.json()),
            fetch(`https://api.modrinth.com/v2/project/${id}/version`).then(r => r.json())
        ]);
        projectVersions = versions;
        const gameVersions = [...new Set(versions.flatMap(v => v.game_versions))].sort((a,b) => b.localeCompare(a, undefined, {numeric: true}));
        const loaders = [...new Set(versions.flatMap(v => v.loaders))].sort();

        const formatBody = (text) => {
            if (!text) return 'No description';
            return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 hover:underline font-bold">$1</a>').replace(/(https?:\/\/[^\s<]+(?:\\.png|\\.jpg|\\.jpeg|\\.gif|\\.webp))/gi, '<img src="$1" class="max-w-full rounded-[32px] my-12 shadow-2xl border-8 border-white mx-auto">');
        };

        document.getElementById('detail-body').innerHTML = `
            <div class="max-w-6xl mx-auto py-12 flex flex-col lg:flex-row gap-12 px-6">
                <div class="flex-1">
                    <button onclick="closePanel()" class="mb-12 text-[10px] font-black opacity-30 hover:opacity-100 tracking-[4px] flex items-center gap-2">✕ CLOSE</button>
                    <div class="flex items-center gap-8 mb-12">
                        <img src="${p.icon_url}" class="w-32 h-32 rounded-[40px] shadow-2xl border-4 border-white">
                        <div>
                            <h2 class="text-4xl md:text-6xl font-black tracking-tighter mb-2">${p.title}</h2>
                            <p class="text-blue-500 font-bold text-xs uppercase tracking-[3px]">ID: ${p.id}</p>
                        </div>
                    </div>
                    <div class="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium text-lg bg-slate-50 p-6 md:p-10 rounded-[48px]">
                        ${formatBody(p.body || p.description)}
                    </div>
                </div>
                <div class="lg:w-96 pt-0 lg:pt-24">
                    <div class="bg-slate-50 p-8 rounded-[40px] border border-slate-100 sticky top-12">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Quick Download</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase mb-2 block">Game Version</label>
                                <select id="ver-select" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all" onchange="updateDownloadBtn()">
                                    ${gameVersions.map(v => `<option value="${v}">${v}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] font-black text-slate-400 uppercase mb-2 block">Mod Loader</label>
                                <select id="loader-select" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all" onchange="updateDownloadBtn()">
                                    ${loaders.map(l => `<option value="${l}">${l}</option>`).join('')}
                                </select>
                            </div>
                            <button id="main-download-btn" class="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-black transition-all text-xs tracking-widest mt-4 disabled:opacity-30 disabled:hover:bg-blue-600">DOWNLOAD ASSET</button>
                            <p id="download-error" class="text-[10px] font-bold text-red-500 text-center hidden">No compatible version found</p>
                        </div>
                    </div>
                </div>
            </div>`;
        updateDownloadBtn();
    } catch(e) { document.getElementById('detail-body').innerHTML = '<div class="max-w-4xl mx-auto py-20 text-center font-black text-red-500">FAILED TO LOAD ASSET DETAILS</div>'; }
};

window.updateDownloadBtn = () => {
    const ver = document.getElementById('ver-select')?.value;
    const loader = document.getElementById('loader-select')?.value;
    const btn = document.getElementById('main-download-btn');
    const err = document.getElementById('download-error');
    if (!ver || !loader || !btn) return;
    const match = projectVersions.find(v => v.game_versions.includes(ver) && v.loaders.includes(loader.toLowerCase()));
    if (match && match.files && match.files[0]) {
        btn.disabled = false;
        err.classList.add('hidden');
        btn.onclick = () => window.open(match.files[0].url, '_blank');
    } else {
        btn.disabled = true;
        err.classList.remove('hidden');
    }
};

window.closePanel = () => { document.getElementById('detail-panel').classList.add('hidden'); document.body.style.overflow = 'auto'; };
window.navPage = (d) => { currentOffset = Math.max(0, currentOffset + (d * 12)); fetchData(); };

document.querySelectorAll('.nav-tab').forEach(btn => btn.onclick = () => {
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('bg-black', 'text-white'));
    btn.classList.add('bg-black', 'text-white');
    currentType = btn.dataset.type;
    selectedFilters = {}; currentOffset = 0;
    renderFilters(); fetchData();
});

document.getElementById('global-search').oninput = () => {
    clearTimeout(window.sT);
    window.sT = setTimeout(() => { currentOffset = 0; fetchData(); }, 500);
};

window.onload = () => { renderFilters(); fetchData(); };
