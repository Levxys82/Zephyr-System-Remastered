const mainVersions = ["1.21", "1.20", "1.19", "1.18", "1.17", "1.16", "1.15", "1.14", "1.13", "1.12", "1.11", "1.10", "1.9", "1.8", "1.7"];
let currentType = 'mod', currentOffset = 0, selectedFilters = {};
let collapsedGroups = new Set();
let projectVersions = [];

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
    let html = `<div class="mb-6"><div class="flex justify-between items-center cursor-pointer py-2 text-xs font-black text-slate-400 uppercase tracking-widest" onclick="toggleGroup('versions')">Game Version <span id="arrow-versions" class="transition-transform" style="transform:rotate(${collapsedGroups.has('versions')?'-90':'0'}deg)">▼</span></div><div id="content-versions" class="space-y-1 mt-2 max-h-48 overflow-y-auto pr-2 ${collapsedGroups.has('versions')?'hidden':''}">${mainVersions.map(v => `<div class="filter-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${selectedFilters.versions?.includes(v)?'active bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 font-bold':''}" onclick="toggleFilter('versions', '${v}', this)">${v}</div>`).join('')}</div></div>`;
    Object.keys(config).forEach(key => {
        const items = config[key];
        html += `<div class="mb-6"><div class="flex justify-between items-center cursor-pointer py-2 text-xs font-black text-slate-400 uppercase tracking-widest" onclick="toggleGroup('${key}')">${key} <span id="arrow-${key}" class="transition-transform" style="transform:rotate(${collapsedGroups.has(key)?'-90':'0'}deg)">▼</span></div><div id="content-${key}" class="space-y-1 mt-2 ${collapsedGroups.has(key)?'hidden':''}">${items.map(f => `<div class="filter-item flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${selectedFilters[key]?.includes(f.toLowerCase())?'active bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 font-bold':''}" onclick="toggleFilter('${key}', '${f.toLowerCase()}', this)">${f}</div>`).join('')}</div></div>`;
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

window.toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

document.getElementById('theme-toggle').onclick = toggleTheme;
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}

const platformNames = {
    bukkit: "Bukkit", forge: "Forge", fabric: "Fabric", purpur: "Purpur",
    spigot: "Spigot", neoforge: "NeoForge", quilt: "Quilt",
    bungeecord: "BungeeCord", velocity: "Velocity"
};

window.fetchData = async () => {
    const grid = document.getElementById('mod-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full py-20 text-center opacity-50 font-black animate-pulse text-slate-400">Syncing...</div>';
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
            grid.innerHTML = data.hits.map((m, i) => `
                <div class="mod-card bg-white dark:bg-dark-light border border-slate-100 dark:border-dark-border rounded-32 overflow-hidden cursor-pointer transition-all group shadow-sm animate-slide-up" style="animation-delay: ${i*50}ms" onclick="openDetail('${m.project_id}')">
                    <div class="h-24 relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark dark:to-dark-light flex items-center px-6">
                        <img src="${m.icon_url}" class="w-16 h-16 rounded-32 border-4 border-white dark:border-dark-border bg-white dark:bg-dark shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://via.placeholder.com/100'">
                    </div>
                    <div class="p-6">
                        <h3 class="font-black text-slate-800 dark:text-slate-100 line-clamp-1 mb-1 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${m.title}</h3>
                        <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">by ${m.author}</p>
                    </div>
                </div>`).join('');
            const totalPages = Math.ceil(data.total_hits / 12);
            const currentPage = Math.floor(currentOffset / 12) + 1;
            document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages}`;
            document.getElementById('prev-page').disabled = currentOffset === 0;
            document.getElementById('next-page').disabled = currentOffset + 12 >= data.total_hits;
        }
    } catch(e) { console.error("Sync error:", e); }
};

window.navPage = (dir) => {
    currentOffset += dir * 12;
    fetchData();
};

window.closePanel = () => {
    document.getElementById('detail-panel').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

window.openDetail = async (id) => {
    const panel = document.getElementById('detail-panel');
    if (!panel) return;
    panel.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('detail-body').innerHTML = '<div class="max-w-4xl mx-auto py-20 text-center font-black opacity-20">LOADING...</div>';
    try {
        const [p, versions] = await Promise.all([
            fetch(`https://api.modrinth.com/v2/project/${id}`).then(r => r.json()),
            fetch(`https://api.modrinth.com/v2/project/${id}/version`).then(r => r.json())
        ]);
        
        const releaseVersions = versions.filter(v => v.version_type === 'release');
        projectVersions = releaseVersions;
        
        const gameVersions = [...new Set(releaseVersions.flatMap(v => v.game_versions))].sort((a,b) => b.localeCompare(a, undefined, {numeric: true}));
        const loaders = [...new Set(releaseVersions.flatMap(v => v.loaders))].sort();
        const publishedDate = new Date(p.published);
        const yearsAgo = Math.floor((new Date() - publishedDate) / (1000 * 60 * 60 * 24 * 365)) || 0;

        document.getElementById('detail-body').innerHTML = `
            <div class="max-w-7xl mx-auto py-12 px-6">
                <div class="flex justify-between items-center mb-8">
                    <button onclick="closePanel()" class="text-[10px] font-black opacity-30 hover:opacity-100 tracking-[4px] flex items-center gap-2 dark:text-white">✕ CLOSE</button>
                    <button onclick="openDownloadModal('${p.id}', '${p.title.replace(/'/g, "\\'")}', '${p.icon_url}')" class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all">Download</button>
                </div>
                <div class="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <img src="${p.icon_url}" class="w-32 h-32 rounded-40 shadow-2xl border-4 border-white dark:border-dark-border">
                    <div class="text-center md:text-left">
                        <h2 class="text-4xl md:text-6xl font-black tracking-tighter mb-2 dark:text-white">${p.title}</h2>
                        <div class="flex flex-wrap justify-center md:justify-start gap-4">
                            <span class="flex items-center gap-2 text-[11px] font-bold text-slate-400"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v6.667a2 2 0 002 2h7a2 2 0 002-2V8.333a2 2 0 00-2-2h-3.333a2 2 0 01-2-2V3a1 1 0 00-2 0v2a3 3 0 00-3 3v2.333z"></path></svg> ${(p.followers || 0).toLocaleString()}</span>
                            <span class="flex items-center gap-2 text-[11px] font-bold text-slate-400"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg> ${(p.downloads || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div class="flex border-b border-slate-100 dark:border-dark-border mb-8 overflow-x-auto">
                    <button class="tab-btn active px-8 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" data-tab="desc">Description</button>
                    <button class="tab-btn px-8 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" data-tab="gallery">Gallery</button>
                    <button class="tab-btn px-8 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" data-tab="changelog">Changelog</button>
                    <button class="tab-btn px-8 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap" data-tab="versions">Versions</button>
                </div>

                <div class="flex flex-col lg:flex-row gap-12">
                    <div id="tab-content" class="flex-1">
                        <div id="desc-tab" class="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-lg bg-slate-50 dark:bg-dark-light p-6 md:p-10 rounded-48">
                            ${p.body || p.description || 'No description available'}
                        </div>
                        <div id="gallery-tab" class="hidden grid grid-cols-1 md:grid-cols-2 gap-6">
                            ${p.gallery ? p.gallery.map(img => `<img src="${img.url}" class="w-full h-64 object-cover rounded-32 cursor-pointer gallery-trigger transition-transform hover:scale-[1.02] shadow-xl">`).join('') : '<p class="text-slate-400 font-bold">No gallery items</p>'}
                        </div>
                        <div id="changelog-tab" class="hidden bg-slate-50 dark:bg-dark-light p-10 rounded-48 prose dark:prose-invert max-w-none">
                             ${p.changelog || 'No changelog available'}
                        </div>
                        <div id="versions-tab" class="hidden space-y-4">
                            ${releaseVersions.slice(0, 10).map(v => `
                                <div class="bg-slate-50 dark:bg-dark-light p-6 rounded-32 flex justify-between items-center">
                                    <div>
                                        <h4 class="font-black dark:text-white">${v.version_number}</h4>
                                        <p class="text-[10px] font-bold text-slate-400 uppercase">${v.game_versions.join(', ')} • ${v.loaders.map(l => platformNames[l.toLowerCase()] || l).join(', ')}</p>
                                    </div>
                                    <button onclick="window.open('${v.files[0].url}', '_blank')" class="bg-black dark:bg-white dark:text-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Download</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="lg:w-80 space-y-6">
                        <div class="bg-slate-50 dark:bg-dark-light p-8 rounded-40 border border-slate-100 dark:border-dark-border">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Compatibility</h3>
                            <div class="space-y-4">
                                <div>
                                    <span class="text-[10px] font-black text-slate-400 uppercase block mb-2">Minecraft: Java Edition</span>
                                    <div class="flex flex-wrap gap-2">
                                        ${gameVersions.slice(0, 5).map(v => `<span class="bg-white dark:bg-dark px-3 py-1 rounded-lg text-[9px] font-black uppercase text-slate-500">${v}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-slate-50 dark:bg-dark-light p-8 rounded-40 border border-slate-100 dark:border-dark-border">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Platforms</h3>
                            <div class="flex flex-wrap gap-2">
                                ${loaders.map(l => `<span class="bg-white dark:bg-dark px-3 py-1 rounded-lg text-[9px] font-black uppercase text-slate-500">${platformNames[l.toLowerCase()] || l}</span>`).join('')}
                            </div>
                        </div>

                        <div class="bg-slate-50 dark:bg-dark-light p-8 rounded-40 border border-slate-100 dark:border-dark-border">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Supported Environments</h3>
                            <div class="space-y-2 text-sm font-bold dark:text-white">
                                ${p.client_side !== 'unsupported' ? '<p>✓ Client-side</p>' : ''}
                                ${p.server_side !== 'unsupported' ? '<p>✓ Server-side</p>' : ''}
                                ${p.client_side !== 'unsupported' && p.server_side !== 'unsupported' ? '<p>✓ Client and server</p>' : ''}
                            </div>
                        </div>

                        <div class="bg-slate-50 dark:bg-dark-light p-8 rounded-40 border border-slate-100 dark:border-dark-border">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Tags</h3>
                            <div class="flex flex-wrap gap-2">
                                ${p.categories.map(c => `<span class="bg-white dark:bg-dark px-3 py-1 rounded-lg text-[9px] font-black uppercase text-slate-500">${c}</span>`).join('')}
                            </div>
                        </div>

                        <div class="bg-slate-50 dark:bg-dark-light p-8 rounded-40 border border-slate-100 dark:border-dark-border">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Creators</h3>
                            <p class="text-sm font-bold dark:text-white mb-2">${p.team || 'Unknown'}</p>
                        </div>

                        <div class="bg-slate-50 dark:bg-dark-light p-8 rounded-40 border border-slate-100 dark:border-dark-border">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Details</h3>
                            <div class="space-y-3 text-[11px] font-bold dark:text-white">
                                <p>Licensed: ${p.license?.name || 'All Rights Reserved'}</p>
                                <p>Published: ${yearsAgo} ${yearsAgo === 1 ? 'year' : 'years'} ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        const verSelect = document.getElementById('modal-ver-select');
        const loaderSelect = document.getElementById('modal-loader-select');
        verSelect.innerHTML = '<option value="">Select game version</option>' + gameVersions.map(v => `<option value="${v}">${v}</option>`).join('');
        loaderSelect.innerHTML = '<option value="">Select Platform</option>' + loaders.map(l => `<option value="${l}">${platformNames[l.toLowerCase()] || l}</option>`).join('');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                ['desc', 'gallery', 'changelog', 'versions'].forEach(t => document.getElementById(`${t}-tab`).classList.add('hidden'));
                document.getElementById(`${btn.dataset.tab}-tab`).classList.remove('hidden');
            };
        });

        document.querySelectorAll('.gallery-trigger').forEach(img => {
            img.onclick = () => {
                const modal = document.getElementById('gallery-modal');
                const modalImg = document.getElementById('gallery-img');
                modalImg.src = img.src;
                modal.classList.remove('hidden');
                setTimeout(() => { modal.classList.add('opacity-100'); modalImg.classList.remove('scale-95'); }, 10);
            };
        });

    } catch(e) { 
        console.error(e);
        document.getElementById('detail-body').innerHTML = '<div class="max-w-4xl mx-auto py-20 text-center font-black text-red-500">FAILED TO LOAD</div>'; 
    }
};

window.openDownloadModal = (id, title, icon) => {
    const modal = document.getElementById('download-modal');
    document.getElementById('dl-modal-title').innerText = title;
    document.getElementById('dl-modal-icon').src = icon;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
    
    const btn = document.getElementById('modal-dl-btn');
    btn.onclick = () => {
        const ver = document.getElementById('modal-ver-select').value;
        const loader = document.getElementById('modal-loader-select').value;
        if (!ver || !loader) return alert("Select version and platform");
        
        const match = projectVersions.find(v => v.game_versions.includes(ver) && v.loaders.map(l => l.toLowerCase()).includes(loader.toLowerCase()));
        if (match && match.files && match.files[0]) {
            window.open(match.files[0].url, '_blank');
        } else {
            alert("No compatible version found");
        }
    };
};

window.closeDownloadModal = () => {
    const modal = document.getElementById('download-modal');
    modal.classList.remove('opacity-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

document.getElementById('global-search').oninput = () => {
    currentOffset = 0;
    fetchData();
};

document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('bg-black', 'dark:bg-white', 'text-white', 'dark:text-black'));
        btn.classList.add('bg-black', 'dark:bg-white', 'text-white', 'dark:text-black');
        currentType = btn.dataset.type;
        currentOffset = 0;
        selectedFilters = {};
        renderFilters();
        fetchData();
    };
});

document.getElementById('gallery-modal').onclick = (e) => {
    if (e.target.id === 'gallery-modal' || e.target.closest('#close-gallery')) {
        const modal = document.getElementById('gallery-modal');
        modal.classList.remove('opacity-100');
        document.getElementById('gallery-img').classList.add('scale-95');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
};

window.onkeydown = (e) => {
    if (e.key === 'Escape' && !document.getElementById('gallery-modal').classList.contains('hidden')) {
        document.getElementById('gallery-modal').click();
    }
};

window.onload = () => { renderFilters(); fetchData(); };
