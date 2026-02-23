/** CharacterGeneratorWidget v1.0 */

export default function CharacterGeneratorWidget(container, props) {
  const { value, onChange, disabled } = props;
  var V = "cg-v4.5-charsync";
  var runtimeCache = window.__CG_WIDGET_RUNTIME_CACHE || (window.__CG_WIDGET_RUNTIME_CACHE = {});
  var widgetCacheKey = String(
    (props && (props.nodeId || props.node_id || props.instanceId || props.id || props.name)) ||
    (container && container.id) ||
    "cg-default"
  );
  var THUMB_SIZE = 320;
  var THUMB_QUALITY = 0.72;
  var MAX_CHAR_PAYLOAD_BYTES = 850 * 1024;
  var MAX_SLOT_PAYLOAD_BYTES = 320 * 1024;

  var MODES = [
    { id: "generate_scratch", label: "Generate New" },
    { id: "modify_existing", label: "Modify Existing" },
    { id: "reference_style", label: "Reference Style" },
  ];

  var SECTIONS = [
    {
      key: "style",
      label: "STYLE",
      options: [
        { id: "photorealistic", name: "Photorealistic", sub: "REAL", desc: "Natural skin texture and lifelike materials." },
        { id: "anime_3d", name: "3D Anime", sub: "ANIME", desc: "Stylized proportions with clean 3D shading." },
        { id: "cyberpunk", name: "Cyberpunk", sub: "NEON", desc: "High-tech contrast with electric accent colors." },
        { id: "comic_ink", name: "Comic Ink", sub: "GRAPHIC", desc: "Bold outlines, strong shape readability, stylized rendering." },
        { id: "fantasy_epic", name: "Fantasy Epic", sub: "MYTHIC", desc: "Heroic fantasy styling with ornate costume language." },
        { id: "noir_gritty", name: "Noir Gritty", sub: "NOIR", desc: "Dark tonal palette with moody character treatment." },
        { id: "steampunk", name: "Steampunk", sub: "RETROTECH", desc: "Victorian-tech fusion with brass and leather motifs." },
        { id: "minimal_clean", name: "Minimal Clean", sub: "SLEEK", desc: "Reduced detail with premium, clean silhouette emphasis." },
        { id: "high_fashion", name: "High Fashion", sub: "RUNWAY", desc: "Editorial styling with dramatic garment silhouette." },
        { id: "game_concept", name: "Game Concept", sub: "PROD", desc: "Production-ready character concept style for games." },
      ],
    },
    {
      key: "hair",
      label: "HAIR",
      options: [
        { id: "short_textured", name: "Short Textured", sub: "CRISP", desc: "Tight cut with controlled breakup." },
        { id: "long_wavy", name: "Long Wavy", sub: "FLOW", desc: "Layered movement and visible strand rhythm." },
        { id: "curly_volume", name: "Curly Volume", sub: "DENSE", desc: "Defined curl clumps and volume silhouette." },
        { id: "braided", name: "Braided", sub: "CRAFT", desc: "Patterned braid structure with clean sectioning." },
        { id: "buzz_cut", name: "Buzz Cut", sub: "MIN", desc: "Minimal cut emphasizing skull shape." },
        { id: "ponytail", name: "Ponytail", sub: "TIED", desc: "Pulled-back style with clear hairline control." },
        { id: "undercut", name: "Undercut", sub: "EDGE", desc: "Contrast sides with emphasized top mass." },
        { id: "locs", name: "Locs", sub: "TEXTURE", desc: "Defined loc bundles with natural weight and taper." },
        { id: "wolf_cut", name: "Wolf Cut", sub: "LAYERED", desc: "Modern layered shape with choppy movement." },
        { id: "afro", name: "Afro", sub: "ICONIC", desc: "Rounded silhouette with rich coil density." },
      ],
    },
    {
      key: "head_accessory",
      label: "HEAD ACCESSORY",
      options: [
        { id: "none", name: "None", sub: "CLEAN", desc: "No head accessory." },
        { id: "glasses", name: "Glasses", sub: "SMART", desc: "Sharp eyewear frame matched to face shape." },
        { id: "hat", name: "Hat", sub: "CLASSIC", desc: "Structured hat silhouette for strong profile." },
        { id: "sombrero", name: "Sombrero", sub: "BOLD", desc: "Wide brim with decorative textile detail." },
        { id: "hood", name: "Hood", sub: "MYSTIC", desc: "Soft hood drape framing the upper face." },
        { id: "beanie", name: "Beanie", sub: "CASUAL", desc: "Close-fit knit cap with soft fold behavior." },
        { id: "helmet", name: "Helmet", sub: "TACTICAL", desc: "Protective shell with clear silhouette geometry." },
        { id: "visor", name: "Visor", sub: "TECH", desc: "Futuristic visor framing eye area emphasis." },
        { id: "headphones", name: "Headphones", sub: "AUDIO", desc: "Over-ear accessory with modern form factor." },
        { id: "crown", name: "Crown", sub: "REGAL", desc: "Royal headpiece with ornamental detailing." },
      ],
    },
    {
      key: "facial_hair",
      label: "FACIAL HAIR",
      options: [
        { id: "none", name: "None", sub: "CLEAN", desc: "No facial hair." },
        { id: "stubble", name: "Stubble", sub: "EDGE", desc: "Fine short stubble with subtle jaw contour." },
        { id: "mustache", name: "Mustache", sub: "ICONIC", desc: "Defined upper-lip shape with clean edges." },
        { id: "goatee", name: "Goatee", sub: "FOCUS", desc: "Chin-focused facial hair for silhouette contrast." },
        { id: "full_beard", name: "Full Beard", sub: "HEAVY", desc: "Thicker growth and strong beard volume." },
        { id: "van_dyke", name: "Van Dyke", sub: "CLASSIC", desc: "Pointed goatee with detached mustache form." },
        { id: "anchor_beard", name: "Anchor Beard", sub: "SHAPED", desc: "Contoured chin strap and mustache balance." },
        { id: "chinstrap", name: "Chinstrap", sub: "LINEAR", desc: "Slim jawline beard with precise edgework." },
        { id: "mutton_chops", name: "Mutton Chops", sub: "VINTAGE", desc: "Strong sideburn volume and cheek framing." },
        { id: "balbo", name: "Balbo", sub: "MODERN", desc: "Separated mustache and sculpted chin beard." },
      ],
    },
    {
      key: "special_accessory",
      label: "SPECIAL ACCESSORY",
      options: [
        { id: "none", name: "None", sub: "CLEAN", desc: "No special accessory." },
        { id: "scar", name: "Scar", sub: "STORY", desc: "Distinct scar placement as identity marker." },
        { id: "tie", name: "Tie", sub: "FORMAL", desc: "Tailored tie with fabric and knot detail." },
        { id: "bandana", name: "Bandana", sub: "REBEL", desc: "Bandana fold and textile pattern presence." },
        { id: "necklace", name: "Necklace", sub: "DETAIL", desc: "Neck accessory with reflective material cues." },
        { id: "earrings", name: "Earrings", sub: "ACCENT", desc: "Ear jewelry with metallic highlight response." },
        { id: "tattoo", name: "Tattoo", sub: "MARK", desc: "Visible tattoo motif integrated with skin flow." },
        { id: "eyepatch", name: "Eyepatch", sub: "ICONIC", desc: "Single-eye patch with strap and texture detail." },
        { id: "armband", name: "Armband", sub: "SYMBOL", desc: "Upper-arm accessory with clear band pattern." },
        { id: "gloves", name: "Gloves", sub: "GEAR", desc: "Handwear details with material and seam cues." },
      ],
    },
    {
      key: "upper_wear",
      label: "UPPER WEAR",
      options: [
        { id: "jacket", name: "Jacket", sub: "CORE", desc: "Structured outer layer with clear seam lines." },
        { id: "hoodie", name: "Hoodie", sub: "CASUAL", desc: "Soft drape with modern streetwear silhouette." },
        { id: "armor_top", name: "Armor Top", sub: "TACTICAL", desc: "Protective chest structure with hard-surface detail." },
        { id: "shirt", name: "Shirt", sub: "CLEAN", desc: "Classic shirt base with collar and fabric folds." },
        { id: "coat", name: "Long Coat", sub: "DRAMA", desc: "Extended coat length with strong vertical flow." },
        { id: "blazer", name: "Blazer", sub: "SMART", desc: "Tailored jacket lines with crisp lapel definition." },
        { id: "trench", name: "Trench Coat", sub: "NOIR", desc: "Double-breasted coat with strong fold dynamics." },
        { id: "kimono", name: "Kimono Top", sub: "TRAD", desc: "Wrap-style upper garment with layered drape." },
        { id: "vest", name: "Utility Vest", sub: "LOADOUT", desc: "Pocketed vest with functional design language." },
        { id: "sweater", name: "Sweater", sub: "SOFT", desc: "Knit texture with relaxed shoulder silhouette." },
      ],
    },
    {
      key: "bottoms",
      label: "BOTTOMS",
      options: [
        { id: "pants", name: "Pants", sub: "CORE", desc: "Structured trouser silhouette and seam logic." },
        { id: "shorts", name: "Shorts", sub: "LIGHT", desc: "Casual short length with layered fabric folds." },
        { id: "dress", name: "Dress", sub: "FLOW", desc: "Dress drape and movement-ready shape language." },
        { id: "cargo", name: "Cargo Pants", sub: "UTILITY", desc: "Pocket-heavy technical cargo profile." },
        { id: "skirt", name: "Skirt", sub: "STYLE", desc: "Skirt cut with clear hem and fabric behavior." },
        { id: "jeans", name: "Jeans", sub: "DENIM", desc: "Denim fit with stitch and fade cues." },
        { id: "joggers", name: "Joggers", sub: "ATHLETIC", desc: "Tapered athletic silhouette with cuff finish." },
        { id: "pleated", name: "Pleated Trousers", sub: "TAILORED", desc: "Pleat structure and formal drape behavior." },
        { id: "battle_skirt", name: "Battle Skirt", sub: "FANTASY", desc: "Armored skirt layering for combat styling." },
        { id: "wide_leg", name: "Wide-Leg Pants", sub: "FASHION", desc: "Loose leg shape with flowing motion profile." },
      ],
    },
    {
      key: "footwear",
      label: "FOOTWEAR",
      options: [
        { id: "sneakers", name: "Sneakers", sub: "MODERN", desc: "Comfort-forward sole with sporty paneling." },
        { id: "boots", name: "Boots", sub: "HEAVY", desc: "Durable boot body and visible hardware details." },
        { id: "dress_shoes", name: "Dress Shoes", sub: "CLEAN", desc: "Polished silhouette with formal finish." },
        { id: "sandals", name: "Sandals", sub: "OPEN", desc: "Open construction and lightweight straps." },
        { id: "combat_boots", name: "Combat Boots", sub: "TACTICAL", desc: "Rugged outsole with laced upper structure." },
        { id: "high_tops", name: "High-Tops", sub: "STREET", desc: "High ankle support with bold street profile." },
        { id: "loafers", name: "Loafers", sub: "SMART", desc: "Slip-on formal/casual hybrid with clean vamp." },
        { id: "heels", name: "Heels", sub: "ELEGANT", desc: "Elevated footwear with sculpted silhouette." },
        { id: "platforms", name: "Platforms", sub: "BOLD", desc: "Chunky sole height with fashion-forward stance." },
        { id: "barefoot_wraps", name: "Barefoot Wraps", sub: "TRIBAL", desc: "Wrapped foot bindings with artisanal detail." },
      ],
    },
  ];

  var selectedMode = (value && value.mode) || "generate_scratch";
  var renderMode = (value && value.render_mode) || "single_character";
  var renderModeEmitTimer = null;
  var briefEmitTimer = null;
  var syncEmitTimer = null;
  var columnsPerRow = 4;
  var briefText = (value && value.character_brief) || "";
  var charThumb = (value && value.char_thumb) || "";
  var charName = (value && value.char_name) || "";
  var hasCharImage = (value && value.has_char_image) || !!charThumb;
  var pendingImageData = "";
  var lastCharImageData = (value && value.char_image_data) || "";
  var charDirty = false;
  var activeSlotUploadKey = "";
  var slotRefMode = {};
  var cardDisabled = {};
  var slotRefThumb = {};
  var slotRefName = {};
  var slotPendingImageData = {};
  var slotLastImageData = {};
  var slotDirty = {};
  var pendingCharSync = false;
  var pendingSlotSyncKeys = [];

  var selections = {};
  SECTIONS.forEach(function(section) {
    selections[section.key] = 0;
    slotRefMode[section.key] = false;
    cardDisabled[section.key] = false;
    slotRefThumb[section.key] = "";
    slotRefName[section.key] = "";
    slotPendingImageData[section.key] = "";
    slotLastImageData[section.key] = "";
    slotDirty[section.key] = false;
  });

  if (value && value.selections && typeof value.selections === "object") {
    SECTIONS.forEach(function(section) {
      var raw = value.selections[section.key];
      if (typeof raw === "number" && raw >= 0 && raw < section.options.length) {
        selections[section.key] = raw;
      }
    });
  }

  if (value && value.card_ref_mode && typeof value.card_ref_mode === "object") {
    SECTIONS.forEach(function(section) {
      if (section.key === "style") return;
      slotRefMode[section.key] = !!value.card_ref_mode[section.key];
    });
  }
  if (value && value.card_disabled && typeof value.card_disabled === "object") {
    SECTIONS.forEach(function(section) {
      cardDisabled[section.key] = !!value.card_disabled[section.key];
    });
  }
  if (value && value.card_ref_thumb && typeof value.card_ref_thumb === "object") {
    SECTIONS.forEach(function(section) {
      if (typeof value.card_ref_thumb[section.key] === "string") slotRefThumb[section.key] = value.card_ref_thumb[section.key];
    });
  }
  if (value && value.card_ref_name && typeof value.card_ref_name === "object") {
    SECTIONS.forEach(function(section) {
      if (typeof value.card_ref_name[section.key] === "string") slotRefName[section.key] = value.card_ref_name[section.key];
    });
  }
  if (value && value.card_image_data && typeof value.card_image_data === "object") {
    SECTIONS.forEach(function(section) {
      if (typeof value.card_image_data[section.key] === "string") slotLastImageData[section.key] = value.card_image_data[section.key];
    });
  }

  function countMapImages(mapObj) {
    if (!mapObj || typeof mapObj !== "object") return 0;
    var n = 0;
    Object.keys(mapObj).forEach(function(k) {
      if (typeof mapObj[k] === "string" && mapObj[k]) n += 1;
    });
    return n;
  }

  // Restore recent in-memory state after transient websocket reconnects.
  var cached = runtimeCache[widgetCacheKey];
  if (cached && typeof cached === "object") {
    if (!charThumb && cached.charThumb) charThumb = cached.charThumb;
    if (!charName && cached.charName) charName = cached.charName;
    if (!lastCharImageData && cached.lastCharImageData) lastCharImageData = cached.lastCharImageData;
    if (!hasCharImage && cached.hasCharImage) hasCharImage = true;
    if (!briefText && cached.briefText) briefText = cached.briefText;
    SECTIONS.forEach(function(section) {
      var key = section.key;
      if (!slotRefThumb[key] && cached.slotRefThumb && cached.slotRefThumb[key]) slotRefThumb[key] = cached.slotRefThumb[key];
      if (!slotRefName[key] && cached.slotRefName && cached.slotRefName[key]) slotRefName[key] = cached.slotRefName[key];
      if (!slotLastImageData[key] && cached.slotLastImageData && cached.slotLastImageData[key]) slotLastImageData[key] = cached.slotLastImageData[key];
      if (!slotRefMode[key] && cached.slotRefMode && cached.slotRefMode[key]) slotRefMode[key] = !!cached.slotRefMode[key];
      if (cached.cardDisabled && typeof cached.cardDisabled[key] === "boolean") cardDisabled[key] = !!cached.cardDisabled[key];
    });
  }

  // If we have local cached images but the upstream value doesn't carry them,
  // schedule one full image re-sync on next emit to recover after reconnects.
  var incomingCharData = !!(value && typeof value.char_image_data === "string" && value.char_image_data);
  var incomingSlotCount = countMapImages(value && value.card_image_data);
  var localSlotCount = countMapImages(slotLastImageData);
  if (lastCharImageData && !incomingCharData) {
    pendingCharSync = true;
  }
  if (localSlotCount > incomingSlotCount) {
    SECTIONS.forEach(function(section) {
      var key = section.key;
      if (key === "style") return;
      if (slotRefMode[key] && slotLastImageData[key]) pendingSlotSyncKeys.push(key);
    });
  }

  function cacheRuntimeState() {
    runtimeCache[widgetCacheKey] = {
      charThumb: charThumb,
      charName: charName,
      hasCharImage: !!hasCharImage,
      lastCharImageData: lastCharImageData,
      briefText: briefText,
      slotRefThumb: Object.assign({}, slotRefThumb),
      slotRefName: Object.assign({}, slotRefName),
      slotRefMode: Object.assign({}, slotRefMode),
      cardDisabled: Object.assign({}, cardDisabled),
      slotLastImageData: Object.assign({}, slotLastImageData),
    };
  }

  container.innerHTML = '<div class="cg-root nodrag nowheel" style="' +
    "display:flex;flex-direction:column;gap:10px;padding:12px;background:#07090d;" +
    "border:1px solid #1d2330;border-radius:12px;color:#c1c9d8;font-family:Inter,Segoe UI,sans-serif;" +
    '"></div>';

  var rootEl = container.querySelector(".cg-root");
  var styleEl = document.createElement("style");
  styleEl.textContent =
    ".cg-root *{box-sizing:border-box}" +
    ".cg-heading{font-size:11px;font-weight:900;letter-spacing:1.3px;text-transform:uppercase;color:#8dcdb3;text-shadow:0 0 8px rgba(50,150,112,.18)}" +
    ".cg-top-row{display:flex;gap:8px;align-items:center}" +
    ".cg-render-row{display:flex;gap:8px;align-items:center;justify-content:center;margin-top:2px;margin-bottom:12px}" +
    ".cg-render-btn{width:190px;max-width:48%;padding:9px 10px;border:1px solid #365d51;border-radius:9px;background:linear-gradient(180deg,#162420,#111c19);color:#aed3c4;font-size:10px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:filter .14s ease,box-shadow .14s ease}" +
    ".cg-render-btn.is-active{background:linear-gradient(180deg,#203730,#192c26);border-color:#5da98a;color:#e4f2ec;box-shadow:0 0 10px rgba(52,146,108,.24), inset 0 0 8px rgba(52,146,108,.12)}" +
    ".cg-render-btn:hover{filter:brightness(1.08)}" +
    ".cg-mode-btn{flex:1;padding:10px 10px;border:1px solid #365d51;border-radius:9px;background:linear-gradient(180deg,#162420,#111c19);color:#aed3c4;font-size:10px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;transition:filter .14s ease,box-shadow .14s ease,transform .14s ease}" +
    ".cg-mode-btn.is-active{background:linear-gradient(180deg,#203730,#192c26);border-color:#5da98a;color:#e4f2ec;box-shadow:0 0 10px rgba(52,146,108,.24), inset 0 0 8px rgba(52,146,108,.12)}" +
    ".cg-mode-btn.is-muted{opacity:.62;filter:saturate(.72) brightness(.9)}" +
    ".cg-mode-btn:hover{filter:brightness(1.08);box-shadow:0 0 7px rgba(92,134,170,.18)}" +
    ".cg-label{font-size:8px;font-weight:800;letter-spacing:1.1px;color:#6f809f;text-transform:uppercase}" +
    ".cg-brief{width:100%;min-height:50px;margin-bottom:14px;padding:8px;background:#0f1a17;color:#d4e7df;border:1px solid #29473f;border-radius:8px;resize:vertical;font-size:10px;line-height:1.3}" +
    ".cg-brief::placeholder{color:#88a397}" +
    ".cg-upload{display:flex;align-items:center;gap:10px;padding:8px;border:1px solid #2a3348;border-radius:10px;background:#0e1320;cursor:pointer}" +
    ".cg-thumb{width:54px;height:54px;border-radius:8px;overflow:hidden;background:#0a0f19;display:flex;align-items:center;justify-content:center;border:1px solid #24304b}" +
    ".cg-grid{display:grid;gap:8px;margin-top:10px}" +
    ".cg-card{position:relative;border:1px solid #222b3a;border-radius:10px;background:#0d121b;padding:7px;cursor:ns-resize;overflow:hidden;aspect-ratio:2/3;display:flex;flex-direction:column;justify-content:space-between}" +
    ".cg-card:hover{border-color:#295889;box-shadow:0 0 9px rgba(30,80,150,.17)}" +
    ".cg-ref-toggle{position:absolute;top:6px;right:6px;padding:0 12px;height:28px;line-height:28px;border-radius:999px;border:1px solid #396355;background:#1a2d27;color:#bddfd2;font-size:9px;font-weight:900;letter-spacing:.7px;cursor:pointer;z-index:6;min-width:92px;text-align:center;transition:filter .14s ease,box-shadow .14s ease}" +
    ".cg-ref-toggle.is-on{border-color:#5ea88a;background:#22493d;color:#e7f4ee;box-shadow:0 0 7px rgba(60,150,112,.22)}" +
    ".cg-ref-toggle:hover{filter:brightness(1.08)}" +
    ".cg-off-toggle{position:absolute;top:6px;right:102px;padding:0 12px;height:28px;line-height:28px;border-radius:999px;border:1px solid #505e77;background:#20293b;color:#b8c2d8;font-size:9px;font-weight:900;letter-spacing:.6px;cursor:pointer;z-index:6;min-width:72px;text-align:center;transition:filter .14s ease,box-shadow .14s ease}" +
    ".cg-off-toggle.is-off{border-color:#7a4f56;background:#3a2126;color:#f2c5cd}" +
    ".cg-off-toggle:hover{filter:brightness(1.08)}" +
    ".cg-chip{display:inline-block;padding:0;border:0;border-radius:0;background:transparent;color:#b9d0f0;font-size:11px;font-weight:900;letter-spacing:.9px;text-transform:uppercase}" +
    ".cg-title{font-size:10px;font-weight:700;letter-spacing:.8px;color:#c3d8f3}" +
    ".cg-sub{font-size:7px;color:#6d7d99;text-transform:uppercase;letter-spacing:1px}" +
    ".cg-name{font-size:12px;font-weight:700;color:#dbe4f4;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".cg-desc{font-size:8px;color:#7d8da8;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".cg-main-center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:8px 6px}" +
    ".cg-name-center{font-size:21px;font-weight:800;line-height:1.15;color:#dfe9f8;letter-spacing:.2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
    ".cg-sub-center{font-size:9px;color:#7a8ba7;letter-spacing:.9px;text-transform:uppercase}" +
    ".cg-hint{font-size:7px;color:#4f607a;letter-spacing:.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".cg-scroll-cue{display:flex;align-items:center;justify-content:center;gap:8px;padding:3px 0;background:transparent;color:#82a8dc;font-size:8px;letter-spacing:.8px;text-transform:uppercase;animation:cgPulse 1.1s ease-in-out 1}" +
    ".cg-scroll-cue .arr{font-size:10px;color:#8fb7eb}" +
    ".cg-card:hover .cg-scroll-cue{filter:brightness(1.08)}" +
    "@keyframes cgPulse{0%{opacity:.65;transform:translateY(0)}50%{opacity:1;transform:translateY(-1px)}100%{opacity:.8;transform:translateY(0)}}" +
    ".cg-image-upload{display:flex;flex-direction:column;justify-content:space-between;height:100%}" +
    ".cg-slot-upload{display:flex;flex-direction:column;justify-content:space-between;height:100%}" +
    ".cg-slot-zone{flex:0 0 74%;border:1px dashed #316188;border-radius:8px;background:#05070a;display:flex;align-items:center;justify-content:center;overflow:hidden}" +
    ".cg-image-zone{flex:0 0 74%;border:1px dashed #2f6a5a;border-radius:8px;background:#05070a;display:flex;align-items:center;justify-content:center;overflow:hidden}" +
    ".cg-version{position:absolute;top:4px;right:6px;font-size:8px;color:#2c3448}" +
    ".cg-card button:hover{filter:brightness(1.1)}";
  container.appendChild(styleEl);

  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  container.appendChild(fileInput);

  var versionEl = document.createElement("div");
  versionEl.className = "cg-version";
  versionEl.textContent = V;
  rootEl.appendChild(versionEl);

  var topRow = document.createElement("div");
  topRow.className = "cg-top-row";
  var titleEl = document.createElement("div");
  titleEl.className = "cg-heading";
  titleEl.textContent = "Character Generator";
  rootEl.appendChild(titleEl);

  var renderRow = document.createElement("div");
  renderRow.className = "cg-render-row";
  rootEl.appendChild(renderRow);

  rootEl.appendChild(topRow);

  var renderButtons = {};
  [
    { id: "single_character", label: "Single Character" },
    { id: "character_sheet", label: "Character Sheet" },
  ].forEach(function(opt) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cg-render-btn";
    btn.textContent = opt.label;
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      if (renderMode === opt.id) return;
      renderMode = opt.id;
      renderRenderButtons();
      if (renderModeEmitTimer) clearTimeout(renderModeEmitTimer);
      renderModeEmitTimer = setTimeout(function() {
        emitChange();
      }, 90);
    });
    renderButtons[opt.id] = btn;
    renderRow.appendChild(btn);
  });

  var modeButtons = {};
  MODES.forEach(function(mode) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cg-mode-btn";
    btn.textContent = mode.label;
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      selectedMode = mode.id;
      renderModeButtons();
      emitChange();
    });
    modeButtons[mode.id] = btn;
    topRow.appendChild(btn);
  });

  var controlsRow = document.createElement("div");
  controlsRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px";
  controlsRow.innerHTML =
    '<div class="cg-label">Character brief (optional)</div>' +
    '<div class="cg-label">Layout fixed: 4 columns</div>';
  rootEl.appendChild(controlsRow);

  var brief = document.createElement("textarea");
  brief.className = "cg-brief";
  brief.placeholder = "Optional: briefly describe core character identity, vibe, or constraints...";
  brief.value = briefText;
  brief.addEventListener("input", function() {
    briefText = brief.value || "";
    if (briefEmitTimer) clearTimeout(briefEmitTimer);
    briefEmitTimer = setTimeout(function() {
      emitChange();
    }, 140);
  });
  brief.addEventListener("blur", function() {
    if (briefEmitTimer) clearTimeout(briefEmitTimer);
    emitChange();
  });
  rootEl.appendChild(brief);

  function resizeToDataURL(img, maxDim, quality) {
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    if (Math.max(w, h) > maxDim) {
      var s = maxDim / Math.max(w, h);
      w = Math.round(w * s);
      h = Math.round(h * s);
    }
    var c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    var ctx = c.getContext("2d");
    if (ctx) ctx.drawImage(img, 0, 0, w, h);
    return c.toDataURL("image/jpeg", quality || 0.8);
  }

  function dataUrlByteLength(dataUrl) {
    if (!dataUrl || typeof dataUrl !== "string") return 0;
    var idx = dataUrl.indexOf(",");
    if (idx < 0) return 0;
    var b64 = dataUrl.slice(idx + 1);
    var padding = 0;
    if (b64.endsWith("==")) padding = 2;
    else if (b64.endsWith("=")) padding = 1;
    return Math.floor((b64.length * 3) / 4) - padding;
  }

  function encodeTransferDataURL(img, maxBytes) {
    var w0 = img.naturalWidth || img.width;
    var h0 = img.naturalHeight || img.height;
    if (!w0 || !h0) return "";

    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");
    if (!ctx) return "";

    var scales = [1, 0.92, 0.85, 0.78, 0.72, 0.66, 0.6, 0.54];
    var qualities = [0.92, 0.85, 0.78, 0.7, 0.62, 0.55, 0.48, 0.4];
    var best = "";

    for (var s = 0; s < scales.length; s++) {
      var scale = scales[s];
      var w = Math.max(1, Math.round(w0 * scale));
      var h = Math.max(1, Math.round(h0 * scale));
      c.width = w;
      c.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      for (var q = 0; q < qualities.length; q++) {
        var url = c.toDataURL("image/jpeg", qualities[q]);
        var size = dataUrlByteLength(url);
        if (!best || size < dataUrlByteLength(best)) best = url;
        if (size <= maxBytes) return url;
      }
    }
    return best;
  }

  fileInput.addEventListener("change", function() {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;

    var blobUrl = URL.createObjectURL(file);
    var img = new window.Image();
    img.onload = function() {
      var nextThumb = resizeToDataURL(img, THUMB_SIZE, THUMB_QUALITY);
      var isSlotUpload = !!activeSlotUploadKey;
      var nextImageData = encodeTransferDataURL(img, isSlotUpload ? MAX_SLOT_PAYLOAD_BYTES : MAX_CHAR_PAYLOAD_BYTES);
      URL.revokeObjectURL(blobUrl);
      if (!nextImageData) {
        fileInput.value = "";
        return;
      }
      if (isSlotUpload && slotRefMode[activeSlotUploadKey]) {
        slotPendingImageData[activeSlotUploadKey] = nextImageData;
        slotLastImageData[activeSlotUploadKey] = nextImageData;
        slotRefThumb[activeSlotUploadKey] = nextThumb;
        slotRefName[activeSlotUploadKey] = file.name.replace(/\.[^.]+$/, "");
        slotDirty[activeSlotUploadKey] = true;
      } else {
        pendingImageData = nextImageData;
        lastCharImageData = nextImageData;
        charThumb = nextThumb;
        charName = file.name.replace(/\.[^.]+$/, "");
        hasCharImage = true;
        charDirty = true;
      }
      activeSlotUploadKey = "";
      renderImageModeCard();
      rerenderCards();
      cacheRuntimeState();
      emitChange();
      fileInput.value = "";
    };
    img.onerror = function() {
      URL.revokeObjectURL(blobUrl);
      activeSlotUploadKey = "";
      fileInput.value = "";
    };
    img.src = blobUrl;
  });

  var grid = document.createElement("div");
  grid.className = "cg-grid";
  rootEl.appendChild(grid);

  var cardEls = {};
  var renderCardByKey = {};
  var imageModeCard = document.createElement("div");
  imageModeCard.className = "cg-card";
  imageModeCard.style.display = "none";
  imageModeCard.addEventListener("click", function(e) {
    e.stopPropagation();
    fileInput.click();
  });
  grid.appendChild(imageModeCard);

  function modeImageLabel() {
    if (selectedMode === "modify_existing") return "EXISTING CHARACTER";
    if (selectedMode === "reference_style") return "REFERENCE STYLE";
    return "REFERENCE IMAGE";
  }

  function renderImageModeCard() {
    var preview = "";
    if (charThumb) {
      preview = '<img src="' + charThumb + '" style="width:100%;height:100%;object-fit:contain;display:block;background:#000" />';
    } else {
      preview = '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;color:#79b8a2">' +
        '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16v12H4z"/><circle cx="9" cy="10" r="1.5"/><path d="M20 15l-4-4-6 6"/></svg>' +
        '<div style="font-size:9px;letter-spacing:.7px;text-transform:uppercase;">Click to load image</div>' +
      "</div>";
    }
    imageModeCard.innerHTML =
      '<div class="cg-image-upload">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
          '<span class="cg-chip">' + modeImageLabel() + '</span>' +
          '<span class="cg-sub">2:3</span>' +
        "</div>" +
        '<div class="cg-image-zone">' + preview + "</div>" +
        '<div style="display:flex;flex-direction:column;gap:2px">' +
              '<div class="cg-name" style="font-size:10px">' + (charName || "Load Character Reference") + "</div>" +
          '<div class="cg-hint">Click card to upload or replace image</div>' +
        "</div>" +
      "</div>";
  }

  function getOption(section) {
    var idx = selections[section.key] || 0;
    return section.options[idx];
  }

  function buildCard(section) {
    var card = document.createElement("div");
    card.className = "cg-card";
    card.dataset.key = section.key;
    grid.appendChild(card);
    cardEls[section.key] = card;

    function renderCard() {
      var idx = selections[section.key] || 0;
      var opt = getOption(section);
      var isSlotRef = section.key !== "style" && !!slotRefMode[section.key];
      var isOff = !!cardDisabled[section.key];
      var offHtml = '<button class="cg-off-toggle ' + (isOff ? "is-off" : "") + '" data-offtoggle="1">' + (isOff ? "OFF" : "ON") + "</button>";
      var toggleHtml = "";
      if (section.key !== "style") {
        toggleHtml = '<button class="cg-ref-toggle ' + (isSlotRef ? "is-on" : "") + '" data-reftoggle="1">' + (isSlotRef ? "REF IMG" : "OPT MODE") + "</button>";
      }
      if (isSlotRef) {
        var slotPreview = "";
        if (slotRefThumb[section.key]) {
          slotPreview = '<img src="' + slotRefThumb[section.key] + '" style="width:100%;height:100%;object-fit:contain;display:block;background:#000" />';
        } else {
          slotPreview = '<div style="display:flex;flex-direction:column;align-items:center;gap:6px;color:#8baed0">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16v12H4z"/><circle cx="9" cy="10" r="1.5"/><path d="M20 15l-4-4-6 6"/></svg>' +
            '<div style="font-size:8px;letter-spacing:.6px;text-transform:uppercase;">Click to upload</div>' +
          "</div>";
        }
        card.innerHTML =
          offHtml +
          toggleHtml +
          '<div class="cg-slot-upload">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
              '<span class="cg-chip">' + section.label + "</span>" +
              '<span class="cg-sub">reference</span>' +
            "</div>" +
            '<div class="cg-slot-zone">' + slotPreview + "</div>" +
            '<div style="display:flex;flex-direction:column;gap:2px">' +
              '<div class="cg-name" style="font-size:10px">' + (slotRefName[section.key] || "Load " + section.label.toLowerCase()) + "</div>" +
              '<div class="cg-hint">Scoped to ' + section.label.toLowerCase() + " only</div>" +
            "</div>" +
          "</div>";
      } else {
        card.innerHTML =
          offHtml +
          toggleHtml +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
            '<span class="cg-chip">' + section.label + '</span>' +
            '<span class="cg-sub">' + (idx + 1) + " / " + section.options.length + "</span>" +
          "</div>" +
          '<div class="cg-main-center">' +
            '<div class="cg-name-center">' + opt.name + "</div>" +
            '<div class="cg-sub-center">' + opt.sub + "</div>" +
          "</div>" +
          '<div style="display:flex;flex-direction:column;gap:3px">' +
            '<div class="cg-scroll-cue"><span class="arr">&#8597;</span><span>Scroll / Drag</span><span class="arr">&#8597;</span></div>' +
          "</div>";
      }

      card.style.opacity = isOff ? "0.5" : "1";
      card.style.borderColor = isOff ? "#5a3f45" : "";

      var toggleEl = card.querySelector("[data-reftoggle]");
      if (toggleEl && section.key !== "style") {
        function onToggle(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
          if (cardDisabled[section.key]) return;
          slotRefMode[section.key] = !slotRefMode[section.key];
          renderCard();
          emitChange();
        }
        toggleEl.addEventListener("click", onToggle);
      }
      var offEl = card.querySelector("[data-offtoggle]");
      if (offEl) {
        offEl.addEventListener("click", function(ev) {
          ev.preventDefault();
          ev.stopPropagation();
          if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
          cardDisabled[section.key] = !cardDisabled[section.key];
          renderCard();
          emitChange();
        });
      }
    }
    renderCardByKey[section.key] = renderCard;

    function step(dir) {
      var total = section.options.length;
      var next = (selections[section.key] + dir + total) % total;
      selections[section.key] = next;
      renderCard();
      emitChange();
    }

    card.addEventListener("wheel", function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (cardDisabled[section.key]) return;
      if (section.key !== "style" && slotRefMode[section.key]) return;
      if (disabled) return;
      step(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    var dragStartY = null;
    card.addEventListener("pointerdown", function(e) {
      var raw = e.target;
      var t = raw && raw.nodeType === 3 ? raw.parentElement : raw;
      var offBtn = t && t.closest ? t.closest("[data-offtoggle]") : null;
      if (offBtn) return;
      var toggleBtn = t && t.closest ? t.closest("[data-reftoggle]") : null;
      if (toggleBtn) return;
      dragStartY = e.clientY;
      try { card.setPointerCapture(e.pointerId); } catch (_) {}
    });
    card.addEventListener("pointerup", function() {
      dragStartY = null;
    });
    card.addEventListener("pointermove", function(e) {
      if (cardDisabled[section.key]) return;
      if (section.key !== "style" && slotRefMode[section.key]) return;
      if (dragStartY === null) return;
      var delta = e.clientY - dragStartY;
      if (Math.abs(delta) < 18) return;
      dragStartY = e.clientY;
      step(delta > 0 ? 1 : -1);
    });

    card.addEventListener("click", function(e) {
      var raw = e.target;
      var t = raw && raw.nodeType === 3 ? raw.parentElement : raw;
      var offBtn = t && t.closest ? t.closest("[data-offtoggle]") : null;
      if (offBtn) return;
      var toggleBtn = t && t.closest ? t.closest("[data-reftoggle]") : null;
      if (toggleBtn) return;
      if (cardDisabled[section.key]) return;
      if (section.key !== "style" && slotRefMode[section.key]) {
        e.stopPropagation();
        activeSlotUploadKey = section.key;
        fileInput.click();
        return;
      }
      e.stopPropagation();
      if (disabled) return;
      var rect = card.getBoundingClientRect();
      var relY = e.clientY - rect.top;
      step(relY < rect.height * 0.5 ? -1 : 1);
    });

    renderCard();
  }

  SECTIONS.forEach(buildCard);

  function rerenderCards() {
    SECTIONS.forEach(function(section) {
      var fn = renderCardByKey[section.key];
      if (fn) fn();
    });
  }

  function renderModeButtons() {
    MODES.forEach(function(mode) {
      var btn = modeButtons[mode.id];
      if (!btn) return;
      var isActive = selectedMode === mode.id;
      btn.classList.toggle("is-active", isActive);
      btn.classList.toggle("is-muted", !isActive);
    });
    updateModeLayout();
  }

  function renderRenderButtons() {
    ["single_character", "character_sheet"].forEach(function(id) {
      var btn = renderButtons[id];
      if (!btn) return;
      btn.classList.toggle("is-active", renderMode === id);
    });
  }

  function renderGridColumns() {
    grid.style.gridTemplateColumns = "repeat(" + columnsPerRow + ", minmax(0, 1fr))";
  }

  function updateModeLayout() {
    var useImageCard = selectedMode !== "generate_scratch";
    var styleCard = cardEls.style;
    if (styleCard) styleCard.style.display = useImageCard ? "none" : "flex";
    imageModeCard.style.display = useImageCard ? "flex" : "none";
    renderImageModeCard();
  }

  function emitChange() {
    if (disabled || !onChange) return;
    var payload = {
      mode: selectedMode,
      render_mode: renderMode,
      columns_per_row: columnsPerRow,
      character_brief: briefText,
      char_thumb: charThumb,
      char_name: charName,
      has_char_image: hasCharImage,
      card_ref_mode: {},
      card_ref_thumb: {},
      card_ref_name: {},
      card_disabled: {},
      card_has_image: {},
      card_image_data: {},
      selections: {},
      setup: {},
    };

    SECTIONS.forEach(function(section) {
      if (section.key === "style" && selectedMode !== "generate_scratch") return;
      payload.card_disabled[section.key] = !!cardDisabled[section.key];
      if (!cardDisabled[section.key]) {
        var idx = selections[section.key] || 0;
        var opt = section.options[idx];
        payload.selections[section.key] = idx;
        payload.setup[section.key] = {
          id: opt.id,
          name: opt.name,
          sub: opt.sub,
          desc: opt.desc,
        };
      }
      if (section.key !== "style") {
        payload.card_ref_mode[section.key] = !!slotRefMode[section.key];
        payload.card_ref_thumb[section.key] = slotRefThumb[section.key] || "";
        payload.card_ref_name[section.key] = slotRefName[section.key] || "";
        payload.card_has_image[section.key] = !!slotLastImageData[section.key];
        if (slotDirty[section.key] && slotPendingImageData[section.key]) {
          payload.card_image_data[section.key] = slotPendingImageData[section.key];
          slotDirty[section.key] = false;
          slotPendingImageData[section.key] = "";
        }
      }
    });

    if (charDirty && pendingImageData) {
      payload.char_image_data = pendingImageData;
      charDirty = false;
      pendingImageData = "";
    } else if (
      hasCharImage &&
      lastCharImageData &&
      (selectedMode === "modify_existing" || selectedMode === "reference_style")
    ) {
      // Keep character identity anchor reliably attached in ref-based modes.
      payload.char_image_data = lastCharImageData;
      pendingCharSync = false;
    } else if (pendingCharSync && hasCharImage && lastCharImageData) {
      payload.char_image_data = lastCharImageData;
      pendingCharSync = false;
    }

    // Re-sync one slot image per emit to avoid large payload spikes/disconnects.
    if (pendingSlotSyncKeys.length > 0) {
      var nextKey = pendingSlotSyncKeys.shift();
      if (nextKey && slotRefMode[nextKey] && slotLastImageData[nextKey]) {
        payload.card_image_data[nextKey] = slotLastImageData[nextKey];
      }
    }

    cacheRuntimeState();
    onChange(payload);

    if (syncEmitTimer) clearTimeout(syncEmitTimer);
    if (pendingSlotSyncKeys.length > 0) {
      syncEmitTimer = setTimeout(function() {
        emitChange();
      }, 120);
    }
  }

  renderModeButtons();
  renderRenderButtons();
  renderGridColumns();
  renderImageModeCard();
  updateModeLayout();

  if (!value || typeof value !== "object" || !value.setup) emitChange();
  if ((pendingCharSync || pendingSlotSyncKeys.length > 0) && !disabled && onChange) {
    if (syncEmitTimer) clearTimeout(syncEmitTimer);
    syncEmitTimer = setTimeout(function() {
      emitChange();
    }, 70);
  }

  return function() {
    if (renderModeEmitTimer) clearTimeout(renderModeEmitTimer);
    if (briefEmitTimer) clearTimeout(briefEmitTimer);
    if (syncEmitTimer) clearTimeout(syncEmitTimer);
  };
}
