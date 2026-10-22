// ===================================================================
// ROBLOX RPG ARCHITECT - INTERACTIVE ORBS ENGINE & SCRIPT EXPLORER
// ===================================================================

(function() {
  'use strict';

  // State Management
  let currentSystemIndex = 0;
  let activeCategory = 'all';
  let searchQuery = '';
  let viewMode = 'orbit'; // 'orbit' or 'grid'
  let soundEnabled = true;
  let hoveredOrbIndex = null;
  let audioCtx = null;

  // DOM Elements
  const spaceCanvas = document.getElementById('space-canvas');
  const orbitCanvas = document.getElementById('orbit-canvas');
  const orbNodesLayer = document.getElementById('orb-nodes-layer');
  const gridCardsContainer = document.getElementById('grid-cards-container');
  const orbitContainer = document.getElementById('orbit-container');
  const gridContainer = document.getElementById('grid-container');

  // Toolbar & Search
  const searchInput = document.getElementById('system-search');
  const searchClearBtn = document.getElementById('search-clear');
  const categoryPillsContainer = document.getElementById('category-pills');
  const btnViewOrbit = document.getElementById('btn-view-orbit');
  const btnViewGrid = document.getElementById('btn-view-grid');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const btnOpenGuide = document.getElementById('btn-open-guide');

  // Hover Tooltip
  const orbTooltip = document.getElementById('orb-tooltip');
  const ttIcon = document.getElementById('tt-icon');
  const ttTitle = document.getElementById('tt-title');
  const ttService = document.getElementById('tt-service');
  const ttDesc = document.getElementById('tt-desc');
  const ttDiff = document.getElementById('tt-diff');

  // Detail Modal
  const detailModal = document.getElementById('detail-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalOrbIcon = document.getElementById('modal-orb-icon');
  const modalNum = document.getElementById('modal-num');
  const modalCategory = document.getElementById('modal-category');
  const modalDiff = document.getElementById('modal-diff');
  const modalTitle = document.getElementById('modal-title');
  const modalTabs = document.querySelectorAll('.modal-tab');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const modalBtnPrev = document.getElementById('modal-btn-prev');
  const modalBtnNext = document.getElementById('modal-btn-next');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const modalBtnCopyBottom = document.getElementById('modal-btn-copy-bottom');

  // Modal Content Fields
  const codeScriptType = document.getElementById('code-script-type');
  const codeLocation = document.getElementById('code-location');
  const codeContent = document.getElementById('code-content');
  const modalStepsList = document.getElementById('modal-steps-list');
  const modalTreeContent = document.getElementById('modal-tree-content');
  const modalOverviewDesc = document.getElementById('modal-overview-desc');
  const modalConfigTbody = document.getElementById('modal-config-tbody');

  // Guide Modal
  const guideModal = document.getElementById('guide-modal');
  const guideCloseBtn = document.getElementById('guide-close');
  const guideBtnOk = document.getElementById('guide-btn-ok');

  // Toast
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  // ===================================================================
  // 1. WEB AUDIO API SYNTHESIZER (SOUND EFFECTS)
  // ===================================================================
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.08) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not permitted yet or unsupported
    }
  }

  function playHoverSound() {
    playTone(520, 'sine', 0.1, 0.04);
  }

  function playClickSound() {
    playTone(740, 'triangle', 0.15, 0.08);
  }

  function playSuccessSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      playTone(587.33, 'sine', 0.12, 0.06); // D5
      setTimeout(() => playTone(880, 'sine', 0.25, 0.07), 100); // A5
    } catch (e) {}
  }

  // ===================================================================
  // 2. STARFIELD BACKGROUND CANVAS
  // ===================================================================
  let stars = [];
  function initStarfield() {
    if (!spaceCanvas) return;
    const ctx = spaceCanvas.getContext('2d');
    let width = (spaceCanvas.width = window.innerWidth);
    let height = (spaceCanvas.height = window.innerHeight);

    stars = [];
    const count = Math.floor((width * height) / 4500);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.015 + 0.005,
        pulse: Math.random() * Math.PI
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Star particles
      for (let star of stars) {
        star.pulse += star.speed;
        const currentAlpha = star.alpha + Math.sin(star.pulse) * 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', () => {
      width = spaceCanvas.width = window.innerWidth;
      height = spaceCanvas.height = window.innerHeight;
    });
  }

  // ===================================================================
  // 3. ORBITAL CONNECTIONS CANVAS (CONSTELLATION RINGS & LINES)
  // ===================================================================
  let orbPositions = [];
  function initOrbitCanvas() {
    if (!orbitCanvas || !orbitContainer) return;
    const ctx = orbitCanvas.getContext('2d');

    function resize() {
      const rect = orbitContainer.getBoundingClientRect();
      orbitCanvas.width = rect.width;
      orbitCanvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    let angleOffset = 0;

    function renderOrbit() {
      const w = orbitCanvas.width;
      const h = orbitCanvas.height;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      if (viewMode === 'orbit') {
        // Calculate dynamic orbital radius based on container size
        const minDim = Math.min(w, h);
        const rx = Math.max(180, minDim * 0.40);
        const ry = Math.max(150, minDim * 0.36);

        // Draw orbital track rings
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx * 0.65, ry * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Calculate positions of each orb
        const total = ROBLOX_SYSTEMS.length;
        orbPositions = [];

        for (let i = 0; i < total; i++) {
          const angle = (i * (2 * Math.PI / total)) - (Math.PI / 2);
          const x = cx + rx * Math.cos(angle);
          const y = cy + ry * Math.sin(angle);
          orbPositions.push({ x, y, system: ROBLOX_SYSTEMS[i] });

          // Light connecting line to center
          const isHovered = hoveredOrbIndex === i;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.strokeStyle = isHovered 
            ? ROBLOX_SYSTEMS[i].color 
            : 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = isHovered ? 2 : 1;
          ctx.stroke();

          // If hovered, draw glowing particle on the line
          if (isHovered) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = ROBLOX_SYSTEMS[i].color;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Update DOM orb elements to match calculated positions
        updateOrbNodePositions();
      }

      angleOffset += 0.002;
      requestAnimationFrame(renderOrbit);
    }
    requestAnimationFrame(renderOrbit);
  }

  // ===================================================================
  // 4. RENDER INTERACTIVE ORB NODES
  // ===================================================================
  function createOrbNodes() {
    orbNodesLayer.innerHTML = '';

    ROBLOX_SYSTEMS.forEach((system, index) => {
      const node = document.createElement('div');
      node.className = 'orb-node';
      node.id = `orb-node-${index}`;
      node.dataset.index = index;
      node.dataset.category = system.category;

      // 3D Spherical markup
      node.innerHTML = `
        <div class="orb-ring" style="border-color: ${system.color};"></div>
        <div class="orb-sphere" style="
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, ${system.color} 45%, ${system.secondaryColor} 80%, #030712 100%);
          box-shadow: 0 0 24px ${system.glowColor}, inset 0 0 12px rgba(255, 255, 255, 0.7);
        ">
          <span class="orb-icon">${system.icon}</span>
        </div>
        <div class="orb-badge-num" style="border-color: ${system.color}; color: ${system.color};">${system.number}</div>
        <div class="orb-caption">${system.shortName}</div>
      `;

      // Hover events
      node.addEventListener('mouseenter', (e) => {
        hoveredOrbIndex = index;
        playHoverSound();
        showTooltip(system, e);
      });

      node.addEventListener('mousemove', (e) => {
        positionTooltip(e);
      });

      node.addEventListener('mouseleave', () => {
        hoveredOrbIndex = null;
        hideTooltip();
      });

      // Click event -> Open modal
      node.addEventListener('click', () => {
        playClickSound();
        openDetailModal(index);
      });

      orbNodesLayer.appendChild(node);
    });
  }

  function updateOrbNodePositions() {
    orbPositions.forEach((pos, index) => {
      const node = document.getElementById(`orb-node-${index}`);
      if (node) {
        node.style.left = `${pos.x}px`;
        node.style.top = `${pos.y}px`;
      }
    });
  }

  // ===================================================================
  // 5. TOOLTIP BEHAVIOR
  // ===================================================================
  function showTooltip(system, e) {
    ttIcon.textContent = system.icon;
    ttTitle.textContent = system.name;
    ttService.textContent = `${system.service} (${system.scriptType})`;
    ttDesc.textContent = system.description;
    ttDiff.textContent = `ระดับ: ${system.difficulty}`;
    
    orbTooltip.style.borderColor = system.color;
    orbTooltip.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px ${system.glowColor}`;
    
    orbTooltip.classList.remove('hidden');
    positionTooltip(e);
  }

  function positionTooltip(e) {
    const tooltipWidth = 300;
    const tooltipHeight = 170;
    const padding = 16;

    let x = e.clientX + 20;
    let y = e.clientY + 20;

    // Boundary detection to prevent clipping off-screen
    if (x + tooltipWidth > window.innerWidth - padding) {
      x = e.clientX - tooltipWidth - 20;
    }
    if (y + tooltipHeight > window.innerHeight - padding) {
      y = e.clientY - tooltipHeight - 20;
    }

    orbTooltip.style.left = `${Math.max(padding, x)}px`;
    orbTooltip.style.top = `${Math.max(padding, y)}px`;
  }

  function hideTooltip() {
    orbTooltip.classList.add('hidden');
  }

  // ===================================================================
  // 6. RENDER GRID MATRIX VIEW
  // ===================================================================
  function createGridCards() {
    gridCardsContainer.innerHTML = '';

    ROBLOX_SYSTEMS.forEach((system, index) => {
      const card = document.createElement('div');
      card.className = 'grid-card';
      card.id = `grid-card-${index}`;
      card.dataset.index = index;
      card.dataset.category = system.category;
      card.style.setProperty('--card-accent', system.color);
      card.style.setProperty('--card-glow', system.glowColor);

      card.innerHTML = `
        <div class="grid-card-header">
          <div class="grid-card-orb" style="
            background: radial-gradient(circle at 35% 35%, #ffffff 0%, ${system.color} 45%, ${system.secondaryColor} 80%, #030712 100%);
          ">
            <span>${system.icon}</span>
          </div>
          <div class="grid-card-title">
            <h3>${system.number}. ${system.name}</h3>
            <span class="grid-card-service">📁 ${system.service}</span>
          </div>
        </div>
        <p class="grid-card-desc">${system.description}</p>
        <div class="grid-card-footer">
          <span class="grid-card-diff">ระดับ: ${system.difficulty}</span>
          <span class="grid-card-btn">เปิดดูโค้ดและวิธีใส่ ➔</span>
        </div>
      `;

      card.addEventListener('mouseenter', () => playHoverSound());
      card.addEventListener('click', () => {
        playClickSound();
        openDetailModal(index);
      });

      gridCardsContainer.appendChild(card);
    });
  }

  // ===================================================================
  // 7. LUA SYNTAX HIGHLIGHTER (LIGHTWEIGHT & SAFE)
  // ===================================================================
  function highlightLua(code) {
    // Escape HTML special characters
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Token replacement map
    const keywords = [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
      'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat',
      'return', 'then', 'true', 'until', 'while'
    ];
    const globals = [
      'game', 'workspace', 'script', 'Instance', 'Vector3', 'CFrame',
      'UDim2', 'Color3', 'Enum', 'math', 'string', 'table', 'task',
      'tick', 'pcall', 'print', 'warn', 'error', '_G', 'pairs', 'ipairs'
    ];

    // Single-line comments -- ...
    escaped = escaped.replace(/(--.*?)(?=\n|$)/g, '<span class="hl-comment">$1</span>');

    // Strings "..." or '...'
    escaped = escaped.replace(/(".*?"|'.*?')(?!class=)/g, '<span class="hl-string">$1</span>');

    // Numbers
    escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="hl-number">$1</span>');

    // Keywords regex
    const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    escaped = escaped.replace(kwRegex, '<span class="hl-keyword">$1</span>');

    // Globals regex
    const glRegex = new RegExp(`\\b(${globals.join('|')})\\b`, 'g');
    escaped = escaped.replace(glRegex, '<span class="hl-global">$1</span>');

    return escaped;
  }

  // ===================================================================
  // 8. DETAIL MODAL LOGIC & DATA INJECTION
  // ===================================================================
  function openDetailModal(index) {
    currentSystemIndex = index;
    const system = ROBLOX_SYSTEMS[index];
    if (!system) return;

    // Header Info
    modalOrbIcon.textContent = system.icon;
    modalOrbIcon.style.background = `radial-gradient(circle at 35% 35%, #ffffff 0%, ${system.color} 45%, ${system.secondaryColor} 80%, #030712 100%)`;
    modalOrbIcon.style.boxShadow = `0 0 25px ${system.glowColor}`;
    
    modalNum.textContent = system.number;
    modalCategory.textContent = system.categoryName;
    modalDiff.textContent = `ระดับ: ${system.difficulty}`;
    modalTitle.textContent = system.name;

    // Tab 1: Code View
    codeScriptType.textContent = system.scriptType;
    codeLocation.textContent = `ตำแหน่ง: ${system.service}`;
    codeContent.innerHTML = highlightLua(system.code);

    // Tab 2: Where to put (Placement)
    modalStepsList.innerHTML = '';
    system.whereToPut.forEach(stepText => {
      const li = document.createElement('li');
      li.className = 'step-guide-item';
      // Format bold markdown (**text** -> <strong>text</strong>)
      li.innerHTML = stepText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      modalStepsList.appendChild(li);
    });

    modalTreeContent.textContent = system.placementTree;

    // Tab 3: Overview
    modalOverviewDesc.textContent = system.description;

    // Tab 4: Config
    modalConfigTbody.innerHTML = '';
    system.configNotes.forEach(cfg => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="config-param-code">${cfg.param}</span></td>
        <td>${cfg.desc}</td>
      `;
      modalConfigTbody.appendChild(tr);
    });

    // Default to Code Tab
    switchModalTab('tab-code');

    // Show Modal
    detailModal.classList.remove('hidden');
    detailModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDetailModal() {
    detailModal.classList.add('hidden');
    detailModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function switchModalTab(tabId) {
    modalTabs.forEach(tab => {
      if (tab.dataset.tab === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    tabPanes.forEach(pane => {
      if (pane.id === tabId) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
  }

  // Previous & Next Navigation
  function navigateModal(direction) {
    playTone(600, 'sine', 0.1, 0.05);
    const total = ROBLOX_SYSTEMS.length;
    let newIndex = (currentSystemIndex + direction + total) % total;
    openDetailModal(newIndex);
  }

  // Copy Code Functionality
  function copyScriptCode() {
    const system = ROBLOX_SYSTEMS[currentSystemIndex];
    if (!system) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(system.code).then(() => {
        showToast(`📋 คัดลอกโค้ดสคริปต์ ${system.name} สำเร็จ!`);
        playSuccessSound();
      }).catch(() => fallbackCopy(system.code));
    } else {
      fallbackCopy(system.code);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('📋 คัดลอกโค้ดสคริปต์สำเร็จ!');
      playSuccessSound();
    } catch (e) {
      showToast('❌ ไม่สามารถคัดลอกอัตโนมัติได้ กรุณาคลุมดำเพื่อคัดลอก');
    }
    document.body.removeChild(textarea);
  }

  function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // ===================================================================
  // 9. FILTER & SEARCH ENGINE
  // ===================================================================
  function applyFilterAndSearch() {
    const query = searchQuery.toLowerCase().trim();

    ROBLOX_SYSTEMS.forEach((system, index) => {
      const matchCategory = activeCategory === 'all' || system.category === activeCategory;
      const matchQuery = !query || 
        system.name.toLowerCase().includes(query) ||
        system.shortName.toLowerCase().includes(query) ||
        system.service.toLowerCase().includes(query) ||
        system.description.toLowerCase().includes(query) ||
        system.code.toLowerCase().includes(query);

      const isMatch = matchCategory && matchQuery;

      // Update in Orbit View
      const orbNode = document.getElementById(`orb-node-${index}`);
      if (orbNode) {
        if (isMatch) {
          orbNode.classList.remove('dimmed');
          if (query) orbNode.classList.add('highlighted');
          else orbNode.classList.remove('highlighted');
        } else {
          orbNode.classList.add('dimmed');
          orbNode.classList.remove('highlighted');
        }
      }

      // Update in Grid View
      const gridCard = document.getElementById(`grid-card-${index}`);
      if (gridCard) {
        if (isMatch) {
          gridCard.style.display = 'flex';
        } else {
          gridCard.style.display = 'none';
        }
      }
    });
  }

  // ===================================================================
  // 10. EVENT LISTENERS SETUP
  // ===================================================================
  function setupEventListeners() {
    // View Switcher
    btnViewOrbit.addEventListener('click', () => {
      viewMode = 'orbit';
      btnViewOrbit.classList.add('active');
      btnViewGrid.classList.remove('active');
      orbitContainer.classList.remove('hidden');
      gridContainer.classList.add('hidden');
      playTone(480, 'sine', 0.1, 0.05);
    });

    btnViewGrid.addEventListener('click', () => {
      viewMode = 'grid';
      btnViewGrid.classList.add('active');
      btnViewOrbit.classList.remove('active');
      gridContainer.classList.remove('hidden');
      orbitContainer.classList.add('hidden');
      playTone(520, 'sine', 0.1, 0.05);
    });

    // Sound Toggle
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
      showToast(soundEnabled ? '🔊 เปิดเสียงเอฟเฟกต์แล้ว' : '🔇 ปิดเสียงเอฟเฟกต์แล้ว');
      if (soundEnabled) playTone(660, 'sine', 0.15, 0.07);
    });

    // Guide Modal
    btnOpenGuide.addEventListener('click', () => {
      guideModal.classList.remove('hidden');
      playTone(540, 'sine', 0.1, 0.05);
    });
    guideCloseBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    guideBtnOk.addEventListener('click', () => guideModal.classList.add('hidden'));

    // Search Input
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      searchClearBtn.classList.toggle('hidden', !searchQuery);
      applyFilterAndSearch();
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.classList.add('hidden');
      applyFilterAndSearch();
      searchInput.focus();
    });

    // Category Pills
    categoryPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.pill');
      if (!pill) return;

      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      activeCategory = pill.dataset.category;
      playTone(580, 'sine', 0.1, 0.04);
      applyFilterAndSearch();
    });

    // Modal Events
    modalCloseBtn.addEventListener('click', closeDetailModal);
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
    guideModal.addEventListener('click', (e) => {
      if (e.target === guideModal) guideModal.classList.add('hidden');
    });

    modalBtnPrev.addEventListener('click', () => navigateModal(-1));
    modalBtnNext.addEventListener('click', () => navigateModal(1));

    modalTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        playTone(500, 'sine', 0.08, 0.04);
        switchModalTab(tab.dataset.tab);
      });
    });

    btnCopyCode.addEventListener('click', copyScriptCode);
    modalBtnCopyBottom.addEventListener('click', copyScriptCode);

    // Keyboard Shortcuts (ESC to close, Left/Right Arrow to navigate)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!detailModal.classList.contains('hidden')) closeDetailModal();
        if (!guideModal.classList.contains('hidden')) guideModal.classList.add('hidden');
      } else if (!detailModal.classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') navigateModal(-1);
        if (e.key === 'ArrowRight') navigateModal(1);
      }
    });
  }

  // ===================================================================
  // 11. INITIALIZATION
  // ===================================================================
  function init() {
    initStarfield();
    createOrbNodes();
    createGridCards();
    initOrbitCanvas();
    setupEventListeners();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
