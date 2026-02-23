/** CinematicDirectorWidget v4.3 — Preload preset thumbs before carousel rebuilds */

var _cd_base_url = '';
try { _cd_base_url = new URL('.', import.meta.url).href; } catch(e) {}

export default function CinematicDirectorWidget(container, props) {
  const { value, onChange, disabled } = props;
  var V = 'v10.4-fullres';
  var THUMB_SIZE = 300, VIS_Q = 0.7;
  var PRESET_HOVER_REARM_MS = 1200;

  function stillUrl(folder, filename) {
    return _cd_base_url + 'stills/' + folder + '/' + encodeURIComponent(filename);
  }
  function stillUrlRoot(filename) {
    return _cd_base_url + 'stills/' + encodeURIComponent(filename);
  }
  function findIdx(sk, ck, optId) {
    var opts = SECTIONS[sk].categories[ck].options;
    for (var i = 0; i < opts.length; i++) { if (opts[i].id === optId) return i; }
    return 0;
  }

  // ═══════════════════════════════════════════════════════════════════
  // ALL SECTION DATA
  // ═══════════════════════════════════════════════════════════════════
  var SECTIONS = {
    style: {
      label: 'STYLE', color: '#3399ff',
      categories: {
        genre: {
          label: 'GENRE',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 11a9 9 0 0 1 9-9"/><path d="M4 4v7h7"/><circle cx="12" cy="12" r="3"/><path d="M20 13a9 9 0 0 1-9 9"/><path d="M20 20v-7h-7"/></svg>',
          tint: { active: '#cc88ff', glow: '#8844cc' },
          options: [
            { id:'scifi', name:'Sci-Fi', sub:'SPECULATIVE', desc:'Futuristic worlds' },
            { id:'horror', name:'Horror', sub:'DARK', desc:'Fear, dread' },
            { id:'action', name:'Action', sub:'HIGH ENERGY', desc:'Explosive' },
            { id:'romance', name:'Romance', sub:'INTIMATE', desc:'Passion' },
            { id:'drama', name:'Drama', sub:'EMOTIONAL', desc:'Deep stories' },
            { id:'thriller', name:'Thriller', sub:'SUSPENSE', desc:'Tension' },
            { id:'fantasy', name:'Fantasy', sub:'MYTHIC', desc:'Magic' },
            { id:'western', name:'Western', sub:'FRONTIER', desc:'Outlaws' },
            { id:'noir', name:'Noir', sub:'SHADOW', desc:'Dark morality' },
            { id:'war', name:'War', sub:'CONFLICT', desc:'Battlefield' },
          ]
        },
        medium: {
          label: 'MEDIUM',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
          tint: { active: '#ff88cc', glow: '#cc4488' },
          options: [
            { id:'photorealistic', name:'Photorealistic', sub:'PHOTO', desc:'Indistinguishable from a real photograph' },
            { id:'anime_2d', name:'2D Anime', sub:'DRAWN', desc:'Cel-shaded Japanese animation' },
            { id:'animation_3d', name:'3D Animation', sub:'CG', desc:'High-end CG animation render' },
            { id:'oil_painting', name:'Oil Painting', sub:'FINE ART', desc:'Thick impasto, visible strokes' },
            { id:'watercolor', name:'Watercolor', sub:'FINE ART', desc:'Soft washes, bleeding pigments' },
            { id:'pencil_sketch', name:'Pencil Sketch', sub:'DRAWN', desc:'Graphite hatching, raw linework' },
            { id:'comic_book', name:'Comic Book', sub:'ILLUSTRATION', desc:'Bold ink, halftone dots' },
            { id:'pixel_art', name:'Pixel Art', sub:'DIGITAL', desc:'Chunky retro pixels' },
            { id:'claymation', name:'Claymation', sub:'STOP-MOTION', desc:'Sculpted clay figures' },
            { id:'synthwave', name:'Synthwave', sub:'RETRO', desc:'Neon grids, 80s futurism' },
            { id:'low_poly', name:'Low Poly', sub:'CG', desc:'Geometric facets, minimal' },
            { id:'collage', name:'Collage', sub:'MIXED MEDIA', desc:'Cut paper, layered textures' },
          ]
        },
        rendering: {
          label: 'RENDERING',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18"/><path d="M8 7l4-4 4 4"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 16v-4h12v4"/></svg>',
          tint: { active: '#88ddff', glow: '#4499cc' },
          options: [
            { id:'ultra_cinematic', name:'Ultra Cinematic', sub:'PREMIUM', desc:'Hollywood-grade polish' },
            { id:'hyperdetailed', name:'Hyperdetailed', sub:'SHARP', desc:'Insane micro-detail, 8K' },
            { id:'soft_dreamy', name:'Soft Dreamy', sub:'ETHEREAL', desc:'Bloom, haze, glow' },
            { id:'gritty_textured', name:'Gritty Textured', sub:'RAW', desc:'Noise, grain, rough' },
            { id:'cel_shaded', name:'Cel-Shaded', sub:'ANIME', desc:'Flat color, sharp outlines' },
            { id:'clean_vector', name:'Clean Vector', sub:'FLAT', desc:'Crisp edges, no texture' },
            { id:'retro_vhs', name:'Retro VHS', sub:'ANALOG', desc:'Scan lines, tracking errors' },
            { id:'glitch_art', name:'Glitch Art', sub:'DIGITAL', desc:'Databend, corruption' },
            { id:'tilt_shift', name:'Tilt-Shift', sub:'MINIATURE', desc:'Selective focus, toy-like' },
            { id:'double_exposure', name:'Double Exposure', sub:'COMPOSITE', desc:'Two images blended' },
            { id:'volumetric_render', name:'Volumetric', sub:'CG', desc:'Light shafts, particles' },
          ]
        },
        palette: {
          label: 'PALETTE',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/></svg>',
          tint: { active: '#ffaa66', glow: '#cc7733' },
          options: [
            { id:'vibrant', name:'Vibrant Saturated', sub:'BOLD', desc:'Punchy, eye-popping' },
            { id:'muted_pastel', name:'Muted Pastel', sub:'SOFT', desc:'Chalky, gentle' },
            { id:'monochrome', name:'Monochrome', sub:'SINGLE', desc:'One hue, full range' },
            { id:'warm_sepia', name:'Warm Sepia', sub:'VINTAGE', desc:'Amber-toned, nostalgic' },
            { id:'cool_desat', name:'Cool Desaturated', sub:'COLD', desc:'Blue-grey, bleak' },
            { id:'neon_cyber', name:'Neon Cyberpunk', sub:'ELECTRIC', desc:'Hot pink, cyan, purple' },
            { id:'earth_tones', name:'Earth Tones', sub:'ORGANIC', desc:'Ochre, olive, sienna' },
            { id:'bw_contrast', name:'High Contrast B&W', sub:'DRAMATIC', desc:'Pure black and white' },
            { id:'golden_warm', name:'Golden Warm', sub:'AMBER', desc:'Honeyed highlights' },
            { id:'ice_blue', name:'Ice Blue', sub:'FROZEN', desc:'Steel blue, frost' },
          ]
        }
      }
    },
    camera: {
      label: 'CAMERA', color: '#3399ff',
      categories: {
        camera: {
          label: 'CAMERA',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="15" height="13" rx="2"/><polygon points="19,8 23,5 23,19 19,16"/></svg>',
          tint: { active: '#ffaa55', glow: '#cc7722' },
          options: [
            { id:'fullframe_cine', name:'Full-Frame Cine', sub:'DIGITAL', desc:'36x24mm, cinematic depth' },
            { id:'super35', name:'Super 35mm', sub:'FILM', desc:'Industry standard' },
            { id:'imax', name:'IMAX 65mm', sub:'FILM', desc:'Epic scale' },
            { id:'anamorphic_s35', name:'Anamorphic S35', sub:'FILM', desc:'2.39:1 widescreen' },
            { id:'red_v_raptor', name:'RED V-RAPTOR', sub:'DIGITAL', desc:'8K Vista Vision' },
            { id:'arri_alexa65', name:'ARRI ALEXA 65', sub:'DIGITAL', desc:'Premium cinema' },
          ]
        },
        lens: {
          label: 'LENS',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/></svg>',
          tint: { active: '#55aaff', glow: '#2277cc' },
          options: [
            { id:'spherical', name:'Spherical Prime', sub:'SPHERICAL', desc:'Classic sharp' },
            { id:'anamorphic', name:'Anamorphic', sub:'ANAMORPHIC', desc:'Oval bokeh, flares' },
            { id:'vintage_anamorphic', name:'Vintage Anamorphic', sub:'ANAMORPHIC', desc:'Warm flares' },
            { id:'tilt_shift', name:'Tilt-Shift', sub:'SPECIAL', desc:'Selective focus' },
            { id:'soft_focus', name:'Soft Focus', sub:'SPECIAL', desc:'Dreamy halation' },
            { id:'cine_zoom', name:'Cinema Zoom', sub:'ZOOM', desc:'Parfocal, smooth' },
            { id:'fisheye', name:'Fisheye', sub:'SPECIAL', desc:'180 ultra-wide' },
          ]
        },
        focal: {
          label: 'FOCAL',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1,12 L23,12 M5,8 L5,16 M19,8 L19,16 M12,6 L12,18"/></svg>',
          tint: { active: '#ff7799', glow: '#cc3366' },
          options: [
            { id:'14mm', name:'14', sub:'mm', desc:'Ultra-wide, dramatic' },
            { id:'24mm', name:'24', sub:'mm', desc:'Wide, slight drama' },
            { id:'35mm', name:'35', sub:'mm', desc:'Natural wide' },
            { id:'50mm', name:'50', sub:'mm', desc:'Human eye' },
            { id:'85mm', name:'85', sub:'mm', desc:'Portrait king' },
            { id:'135mm', name:'135', sub:'mm', desc:'Compressed bokeh' },
            { id:'200mm', name:'200', sub:'mm', desc:'Telephoto' },
          ]
        },
        aperture: {
          label: 'APERTURE',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12,2 L14,10 M22,12 L14,12 M12,22 L10,14 M2,12 L10,12"/></svg>',
          tint: { active: '#66dd88', glow: '#33aa55' },
          options: [
            { id:'f1.2', name:'f/1.2', sub:'', desc:'Ultra shallow' },
            { id:'f1.4', name:'f/1.4', sub:'', desc:'Very shallow DOF' },
            { id:'f2', name:'f/2', sub:'', desc:'Beautiful bokeh' },
            { id:'f2.8', name:'f/2.8', sub:'', desc:'Pro zoom standard' },
            { id:'f5.6', name:'f/5.6', sub:'', desc:'Sharp, moderate' },
            { id:'f8', name:'f/8', sub:'', desc:'Landscape sweet spot' },
            { id:'f16', name:'f/16', sub:'', desc:'Deep focus' },
          ]
        },
        filmstock: {
          label: 'FILM',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="12" r="4"/></svg>',
          tint: { active: '#cc88ff', glow: '#8844cc' },
          options: [
            { id:'kodak_portra400', name:'Portra 400', sub:'COLOR', desc:'Warm skin tones' },
            { id:'kodak_ektar100', name:'Ektar 100', sub:'COLOR', desc:'Vivid saturated' },
            { id:'fuji_velvia50', name:'Velvia 50', sub:'SLIDE', desc:'Hyper punchy' },
            { id:'cinestill_800t', name:'CineStill 800T', sub:'TUNGSTEN', desc:'Halation glow' },
            { id:'kodak_vision3_500t', name:'Vision3 500T', sub:'MOTION', desc:'Cinema standard' },
            { id:'ilford_hp5', name:'HP5 Plus', sub:'B&W', desc:'Classic gritty' },
            { id:'kodak_trix400', name:'Tri-X 400', sub:'B&W', desc:'Iconic contrast' },
            { id:'digital_clean', name:'Digital Clean', sub:'DIGITAL', desc:'No emulation' },
          ]
        }
      }
    },
    character: {
      label: 'CHARACTER', color: '#3399ff', hasImage: true,
      categories: {
        pose: {
          label: 'POSE',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="4" r="2.5"/><path d="M12 6.5v5"/><path d="M8 18l4-6.5 4 6.5"/><path d="M7 11h10"/></svg>',
          tint: { active: '#55ddaa', glow: '#22aa77' },
          options: [
            { id:'standing_hero', name:'Hero Stand', sub:'POWER', desc:'Feet apart, chest out, commanding' },
            { id:'walking_toward', name:'Walking Toward', sub:'APPROACH', desc:'Striding forward with purpose' },
            { id:'leaning_wall', name:'Leaning on Wall', sub:'CASUAL', desc:'Relaxed shoulder lean, arms crossed' },
            { id:'sitting_edge', name:'Sitting on Edge', sub:'PENSIVE', desc:'Perched, legs dangling, contemplative' },
            { id:'crouching', name:'Crouching', sub:'READY', desc:'Low, coiled, ready to spring' },
            { id:'running', name:'Running', sub:'MOTION', desc:'Mid-stride, dynamic blur' },
            { id:'arms_raised', name:'Arms Raised', sub:'TRIUMPH', desc:'Fists up, victory, celebration' },
            { id:'looking_over_shoulder', name:'Over Shoulder', sub:'MYSTERY', desc:'Turning back, glance behind' },
            { id:'kneeling', name:'Kneeling', sub:'DEVOTION', desc:'One knee down, head bowed or raised' },
            { id:'hands_in_pockets', name:'Hands in Pockets', sub:'COOL', desc:'Relaxed swagger, effortless' },
            { id:'pointing', name:'Pointing', sub:'COMMAND', desc:'Finger extended, directing attention' },
            { id:'dancing', name:'Dancing', sub:'RHYTHM', desc:'Mid-move, fluid body expression' },
            { id:'fighting_stance', name:'Fighting Stance', sub:'COMBAT', desc:'Guard up, weight balanced' },
            { id:'lying_down', name:'Lying Down', sub:'REST', desc:'Supine or on side, vulnerable' },
            { id:'back_turned', name:'Back Turned', sub:'DEPARTURE', desc:'Walking away, mysterious exit' },
            { id:'mid_jump', name:'Mid-Jump', sub:'AIRBORNE', desc:'Suspended in air, weightless' },
            { id:'hugging_self', name:'Hugging Self', sub:'COMFORT', desc:'Arms wrapped, seeking warmth' },
            { id:'reaching_out', name:'Reaching Out', sub:'YEARNING', desc:'Hand extended, desperate or inviting' },
            { id:'silhouette', name:'Silhouette', sub:'SHADOW', desc:'Backlit outline, identity hidden' },
            { id:'seated_throne', name:'Seated Throne', sub:'REGAL', desc:'Commanding seated position, authority' },
            { id:'climbing', name:'Climbing', sub:'ASCENT', desc:'Scaling upward, determination' },
            { id:'falling', name:'Falling', sub:'DESCENT', desc:'Mid-fall, suspended in gravity' },
            { id:'meditating', name:'Meditating', sub:'STILLNESS', desc:'Cross-legged, eyes closed, centered' },
            { id:'aiming', name:'Aiming', sub:'FOCUS', desc:'Weapon or tool raised, locked on target' },
            { id:'carrying', name:'Carrying', sub:'BURDEN', desc:'Hauling weight, strain visible' },
            { id:'embracing', name:'Embracing', sub:'CONNECTION', desc:'Holding another, warmth and bond' },
            { id:'fetal', name:'Fetal Position', sub:'VULNERABLE', desc:'Curled up, self-protection' },
            { id:'dramatic_turn', name:'Dramatic Turn', sub:'REVEAL', desc:'Mid-spin, coat or hair flowing' },
            { id:'hands_on_face', name:'Hands on Face', sub:'ANGUISH', desc:'Covering eyes or mouth, overwhelmed' },
            { id:'t_pose_spread', name:'Arms Spread Wide', sub:'FREEDOM', desc:'Embracing the void' },
          ]
        },
        emotion: {
          label: 'EMOTION',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 9.05v-.1"/><path d="M16 9.05v-.1"/><path d="M12 13a4 4 0 0 0 4 3H8a4 4 0 0 0 4-3z"/></svg>',
          tint: { active: '#ff6688', glow: '#cc3355' },
          options: [
            { id:'happy', name:'Happy', sub:'JOY', desc:'Warm, radiant, uplifting' },
            { id:'sad', name:'Sad', sub:'SORROW', desc:'Grief, loss, melancholy' },
            { id:'angry', name:'Angry', sub:'RAGE', desc:'Fury, intensity, fire' },
            { id:'fearful', name:'Fearful', sub:'TERROR', desc:'Dread, anxiety, panic' },
            { id:'surprised', name:'Surprised', sub:'SHOCK', desc:'Awe, disbelief, wonder' },
            { id:'confident', name:'Confident', sub:'POWER', desc:'Commanding, bold, strong' },
            { id:'vulnerable', name:'Vulnerable', sub:'EXPOSED', desc:'Raw, fragile, open' },
            { id:'mysterious', name:'Mysterious', sub:'ENIGMA', desc:'Cryptic, alluring, hidden' },
            { id:'melancholic', name:'Melancholic', sub:'WISTFUL', desc:'Bittersweet nostalgia' },
            { id:'euphoric', name:'Euphoric', sub:'ECSTASY', desc:'Transcendent, blissful' },
            { id:'stoic', name:'Stoic', sub:'RESOLVE', desc:'Unwavering, composed' },
            { id:'anxious', name:'Anxious', sub:'UNEASE', desc:'Nervous tension, restless' },
            { id:'defiant', name:'Defiant', sub:'REBEL', desc:'Unyielding resistance' },
            { id:'serene', name:'Serene', sub:'CALM', desc:'Peaceful, still, balanced' },
            { id:'desperate', name:'Desperate', sub:'EDGE', desc:'Last resort, survival' },
          ]
        }
      }
    },
    environment: {
      label: 'ENVIRONMENT', color: '#3399ff',
      categories: {
        setting: {
          label: 'SETTING',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>',
          tint: { active: '#55ccaa', glow: '#228866' },
          options: [
            { id:'city_street', name:'City Street', sub:'URBAN', desc:'Neon signs, traffic' },
            { id:'rooftop', name:'Rooftop', sub:'URBAN', desc:'Skyline horizon' },
            { id:'alley', name:'Dark Alley', sub:'URBAN', desc:'Narrow, grimy' },
            { id:'forest', name:'Dense Forest', sub:'NATURE', desc:'Towering trees' },
            { id:'desert', name:'Desert', sub:'ARID', desc:'Endless sand' },
            { id:'ocean_shore', name:'Ocean Shore', sub:'COASTAL', desc:'Crashing waves' },
            { id:'mountain_peak', name:'Mountain Peak', sub:'ALPINE', desc:'Vast panorama' },
            { id:'space_station', name:'Space Station', sub:'SCI-FI', desc:'Zero-G corridors' },
            { id:'cyberpunk_city', name:'Cyberpunk City', sub:'FUTURISTIC', desc:'Holograms, chrome' },
            { id:'ancient_ruins', name:'Ancient Ruins', sub:'HISTORICAL', desc:'Crumbling stone' },
            { id:'battlefield', name:'Battlefield', sub:'WAR', desc:'Smoke, devastation' },
            { id:'ballroom', name:'Ballroom', sub:'OPULENT', desc:'Chandeliers' },
            { id:'arctic', name:'Arctic Tundra', sub:'FROZEN', desc:'Ice sheets, blizzard' },
          ]
        },
        weather: {
          label: 'WEATHER',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 19a5 5 0 0 1-.5-9.96A7 7 0 0 1 18.5 9H19a4 4 0 0 1 0 8H6z"/></svg>',
          tint: { active: '#66aaff', glow: '#3377cc' },
          options: [
            { id:'clear', name:'Clear Sky', sub:'CALM', desc:'Pristine' },
            { id:'rain_heavy', name:'Heavy Rain', sub:'STORM', desc:'Downpour' },
            { id:'snow', name:'Snowfall', sub:'WINTER', desc:'Flakes drifting' },
            { id:'fog', name:'Dense Fog', sub:'OBSCURED', desc:'Eerie zero visibility' },
            { id:'thunderstorm', name:'Thunderstorm', sub:'VIOLENT', desc:'Lightning cracks' },
            { id:'sandstorm', name:'Sandstorm', sub:'HARSH', desc:'Orange haze' },
            { id:'wind', name:'Strong Wind', sub:'DYNAMIC', desc:'Hair whipping' },
            { id:'aurora', name:'Aurora', sub:'ETHEREAL', desc:'Color ribbons' },
          ]
        },
        timeofday: {
          label: 'TIME',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>',
          tint: { active: '#ffcc55', glow: '#cc9922' },
          options: [
            { id:'dawn', name:'Dawn', sub:'EARLY', desc:'First light, pink' },
            { id:'golden_hour_am', name:'Morning Golden', sub:'WARM', desc:'Long amber shadows' },
            { id:'midday', name:'Harsh Midday', sub:'BRIGHT', desc:'Stark contrast' },
            { id:'golden_hour_pm', name:'Evening Golden', sub:'MAGIC', desc:'Everything gilded' },
            { id:'blue_hour', name:'Blue Hour', sub:'TWILIGHT', desc:'City lights awaken' },
            { id:'night_moonlit', name:'Moonlit Night', sub:'LUNAR', desc:'Silver wash' },
            { id:'night_dark', name:'Pitch Dark', sub:'NOIR', desc:'Isolated light pools' },
            { id:'night_neon', name:'Neon Night', sub:'ELECTRIC', desc:'Artificial glow' },
          ]
        },
        lighting: {
          label: 'LIGHTING',
          icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
          tint: { active: '#ffdd66', glow: '#ccaa33' },
          options: [
            { id:'natural_ambient', name:'Natural Ambient', sub:'SOFT', desc:'Undirected, even fill' },
            { id:'rembrandt', name:'Rembrandt', sub:'CLASSIC', desc:'Triangle shadow under eye' },
            { id:'butterfly', name:'Butterfly', sub:'GLAMOUR', desc:'Shadow under nose, beauty' },
            { id:'split', name:'Split Light', sub:'DRAMATIC', desc:'Half face lit, half dark' },
            { id:'rim_edge', name:'Rim / Edge', sub:'BACKLIT', desc:'Silhouette outline glow' },
            { id:'low_key', name:'Low Key', sub:'SHADOW', desc:'Mostly dark, high contrast' },
            { id:'high_key', name:'High Key', sub:'BRIGHT', desc:'Minimal shadow, airy' },
            { id:'neon_practical', name:'Neon Practical', sub:'COLOR', desc:'Colored neon sources' },
            { id:'candlelight', name:'Candlelight', sub:'WARM', desc:'Flickering, intimate' },
            { id:'spotlight', name:'Spotlight', sub:'FOCUSED', desc:'Single harsh beam' },
            { id:'volumetric_godrays', name:'God Rays', sub:'EPIC', desc:'Shafts through haze' },
            { id:'strobe', name:'Strobe Flash', sub:'FROZEN', desc:'Harsh frozen motion' },
          ]
        }
      }
    }
  };

  var PRESETS = {
    style: [
      { name:'Ultra Cinematic', desc:'Hollywood photorealism, peak polish', img:'Ultra Cinematic.jpg', folder:'styles', settings:{ genre:'action', medium:'photorealistic', rendering:'ultra_cinematic', palette:'vibrant' } },
      { name:'Anime Dreams', desc:'Warm anime, dreamy softness', img:'Anime Dreams.jpg', folder:'styles', settings:{ genre:'fantasy', medium:'anime_2d', rendering:'soft_dreamy', palette:'muted_pastel' } },
      { name:'3D Animation', desc:'Polished CG, vibrant color', img:'3D Animation.jpg', folder:'styles', settings:{ genre:'fantasy', medium:'animation_3d', rendering:'volumetric_render', palette:'vibrant' } },
      { name:'Horror', desc:'Dark dread, gritty desaturated terror', img:'Horror.jpg', folder:'styles', settings:{ genre:'horror', medium:'photorealistic', rendering:'gritty_textured', palette:'cool_desat' } },
      { name:'Graphic Novel', desc:'Bold ink, vivid saturated color', img:'Graphic Novel.jpg', folder:'styles', settings:{ genre:'action', medium:'comic_book', rendering:'gritty_textured', palette:'vibrant' } },
      { name:'Neon Retro', desc:'Synthwave chrome, VHS glow', img:'Neon Retro.jpg', folder:'styles', settings:{ genre:'scifi', medium:'synthwave', rendering:'retro_vhs', palette:'neon_cyber' } },
      { name:'Renaissance', desc:'Classical oil, golden light', img:'Renaissance.jpg', folder:'styles', settings:{ genre:'drama', medium:'oil_painting', rendering:'hyperdetailed', palette:'golden_warm' } },
      { name:'Frozen Noir', desc:'Icy desaturated photorealism', img:'Frozen Noir.jpg', folder:'styles', settings:{ genre:'noir', medium:'photorealistic', rendering:'gritty_textured', palette:'ice_blue' } },
      { name:'Ethereal Watercolor', desc:'Soft pastel pigment washes', img:'Ethereal Watercolor.jpg', folder:'styles', settings:{ genre:'romance', medium:'watercolor', rendering:'soft_dreamy', palette:'muted_pastel' } },
      { name:'Glitch Future', desc:'Corrupted digital duotone', img:'Glitch Future.jpg', folder:'styles', settings:{ genre:'scifi', medium:'low_poly', rendering:'glitch_art', palette:'neon_cyber' } },
    ],
    camera: [
      { name:'Cinematic Portrait', desc:'Shallow DOF, warm golden tones', img:'Cinematic portrait.jpg', folder:'', settings:{ camera:'fullframe_cine', lens:'spherical', focal:'85mm', aperture:'f1.4', filmstock:'kodak_portra400' } },
      { name:'Action Thriller', desc:'Wide anamorphic, neon tension', img:'Action Thirller.jpg', folder:'', settings:{ camera:'super35', lens:'anamorphic', focal:'24mm', aperture:'f2.8', filmstock:'kodak_vision3_500t' } },
      { name:'Horror', desc:'Suffocating close-up, dark tones', img:'Horror.jpg', folder:'', settings:{ camera:'super35', lens:'spherical', focal:'50mm', aperture:'f1.4', filmstock:'kodak_vision3_500t' } },
      { name:'Noir Detective', desc:'High contrast B&W, deep shadows', img:'Noir Detective.jpg', folder:'', settings:{ camera:'fullframe_cine', lens:'vintage_anamorphic', focal:'35mm', aperture:'f2', filmstock:'kodak_trix400' } },
      { name:'Sci-Fi Epic', desc:'Ultra-wide IMAX, cold futuristic', img:'Sci-Fi Epic.jpg', folder:'', settings:{ camera:'arri_alexa65', lens:'anamorphic', focal:'14mm', aperture:'f2.8', filmstock:'kodak_vision3_500t' } },
      { name:'Romance', desc:'Dreamy soft focus, warm pastels', img:'Romance.jpg', folder:'', settings:{ camera:'fullframe_cine', lens:'soft_focus', focal:'85mm', aperture:'f1.2', filmstock:'kodak_portra400' } },
      { name:'Western', desc:'Sweeping wide, golden dust', img:'Western.jpg', folder:'', settings:{ camera:'imax', lens:'spherical', focal:'24mm', aperture:'f8', filmstock:'kodak_ektar100' } },
      { name:'Fantasy', desc:'Medium format, swirl bokeh', img:'Fantasy.jpg', folder:'', settings:{ camera:'fullframe_cine', lens:'spherical', focal:'50mm', aperture:'f1.4', filmstock:'fuji_velvia50' } },
      { name:'Music Video', desc:'Fisheye distortion, neon color', img:'Music Video.jpg', folder:'', settings:{ camera:'red_v_raptor', lens:'fisheye', focal:'14mm', aperture:'f2.8', filmstock:'fuji_velvia50' } },
    ],
    environment: [
      { name:'Neon Downpour', desc:'Rain-soaked cyberpunk neon night', img:'Neon Downpour.jpg', folder:'environments', settings:{ setting:'cyberpunk_city', weather:'rain_heavy', timeofday:'night_neon', lighting:'neon_practical' } },
      { name:'Lost Temple', desc:'Overgrown ruins, golden mist', img:'Lost Temple.jpg', folder:'environments', settings:{ setting:'ancient_ruins', weather:'fog', timeofday:'golden_hour_am', lighting:'volumetric_godrays' } },
      { name:'Arctic Expedition', desc:'Frozen tundra, aurora night', img:'Arctic Expedition.jpg', folder:'environments', settings:{ setting:'arctic', weather:'aurora', timeofday:'night_dark', lighting:'natural_ambient' } },
      { name:'Desert Storm', desc:'Sandstorm engulfing dunes', img:'Desert Storm.jpg', folder:'environments', settings:{ setting:'desert', weather:'sandstorm', timeofday:'midday', lighting:'natural_ambient' } },
      { name:'Noir Alley', desc:'Foggy alley, moonlit wet pavement', img:'Noir Alley.jpg', folder:'environments', settings:{ setting:'alley', weather:'fog', timeofday:'night_moonlit', lighting:'low_key' } },
      { name:'Golden Rooftop', desc:'City rooftop, evening golden glow', img:'Golden Rooftop.jpg', folder:'environments', settings:{ setting:'rooftop', weather:'clear', timeofday:'golden_hour_pm', lighting:'rim_edge' } },
      { name:'Deep Space', desc:'Space station, emergency lighting', img:'Deep Space.jpg', folder:'environments', settings:{ setting:'space_station', weather:'clear', timeofday:'night_dark', lighting:'spotlight' } },
      { name:'Enchanted Forest', desc:'Misty forest at dawn', img:'Enchanted Forest.jpg', folder:'environments', settings:{ setting:'forest', weather:'rain_heavy', timeofday:'dawn', lighting:'volumetric_godrays' } },
      { name:'Volcanic Wasteland', desc:'Battlefield, raining ash', img:'Volcanic Wasteland.jpg', folder:'environments', settings:{ setting:'battlefield', weather:'sandstorm', timeofday:'midday', lighting:'low_key' } },
    ],
  };

  var presetThumbCache = {};
  var rebuildVersionBySection = {};

  var sectionKeys = Object.keys(SECTIONS);

  // ═══════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════
  var state = {};
  var presetState = {};
  var customPresets = {};
  var savedScenes = [];
  var savedCarouselScroll = {};

  sectionKeys.forEach(function(sk) {
    state[sk] = { selections: {}, collapsed: false, disabled: {}, sectionOff: false };
    presetState[sk] = -1;
    customPresets[sk] = [];
    var catKeys = Object.keys(SECTIONS[sk].categories);
    catKeys.forEach(function(ck) { state[sk].selections[ck] = 0; state[sk].disabled[ck] = false; });
  });

  if (value && typeof value === 'object') {
    sectionKeys.forEach(function(sk) {
      var sv = value[sk];
      if (sv && typeof sv === 'object' && sv.selections) {
        Object.keys(sv.selections).forEach(function(ck) {
          if (typeof sv.selections[ck] === 'number') state[sk].selections[ck] = sv.selections[ck];
        });
      }
      if (sv && typeof sv.collapsed === 'boolean') state[sk].collapsed = sv.collapsed;
      if (sv && typeof sv.sectionOff === 'boolean') state[sk].sectionOff = sv.sectionOff;
      if (sv && typeof sv._active_preset === 'number') presetState[sk] = sv._active_preset;
      if (sv && typeof sv._carousel_scroll === 'number') savedCarouselScroll[sk] = sv._carousel_scroll;
      if (sv && sv.disabled && typeof sv.disabled === 'object') {
        Object.keys(sv.disabled).forEach(function(ck) {
          if (typeof sv.disabled[ck] === 'boolean') state[sk].disabled[ck] = sv.disabled[ck];
        });
      }
    });
    if (Array.isArray(value._custom_presets)) {
      value._custom_presets.forEach(function(cp) {
        var sk = cp && (cp._section || cp.section);
        if (sk && customPresets[sk]) customPresets[sk].push(cp);
      });
    }
    if (Array.isArray(value._saved_scenes)) savedScenes = value._saved_scenes;
  }

  var charThumb = (value && value.char_thumb) || '';
  var charName = (value && value.char_name) || '';
  var hasCharImage = (value && value.has_char_image) || !!charThumb;
  var pendingImageData = '';
  var charDirty = false;
  var activeSection = null;
  var activeCard = null;

  // ═══════════════════════════════════════════════════════════════════
  // DOM SHELL
  // ═══════════════════════════════════════════════════════════════════
  container.innerHTML = '<div class="cd-root nodrag nowheel" tabindex="0" style="' +
    'display:flex;flex-direction:column;gap:0;padding:10px 0;' +
    'background:#000000;border-radius:12px;user-select:none;width:100%;box-sizing:border-box;' +
    'font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;' +
    'color:#ccc;overflow:hidden;border:1px solid #1f2233;"></div>';

  var st = document.createElement('style');
  st.textContent = '.cd-root *{box-sizing:border-box}' +
    '.cd-root{background-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E");background-repeat:repeat;background-size:200px}' +
    '.cd-pbar{position:absolute;bottom:0;left:0;height:2px;background:linear-gradient(90deg,#1a5599,#3399ff);border-radius:0 1px 0 0;transition:width 0.3s ease}' +
    '.cd-section-gap{height:24px;background:transparent}' +
    '.cd-panel{background:rgba(18,20,28,0.82);border:1px solid #4a5068;border-radius:10px;margin:0 24px 6px 24px;padding-bottom:6px;overflow:hidden}' +
    '.cd-custom-thumb{position:relative}' +
    '.cd-custom-thumb .cd-x{position:absolute;top:2px;right:3px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,0.8);color:#ff5566;font-size:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity 0.15s;z-index:4;border:1px solid #444}' +
    '.cd-custom-thumb:hover .cd-x{opacity:1}';
  container.appendChild(st);

  var rootEl = container.querySelector('.cd-root');
  rootEl.innerHTML = '<div class="cd-ver" style="position:absolute;right:4px;top:2px;font-size:7px;color:#333;pointer-events:none;z-index:5;">' + V + '</div>';

  var fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
  container.appendChild(fileInput);

  function resizeToDataURL(img, maxDim, quality) {
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    if (Math.max(w, h) > maxDim) { var s = maxDim / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return c.toDataURL('image/jpeg', quality || 0.85);
  }

  fileInput.addEventListener('change', function() {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;

    var imageDataReady = false;
    var thumbReady = false;
    var nextImageData = '';
    var nextThumb = '';

    function finalizeIfReady() {
      if (!imageDataReady || !thumbReady) return;
      pendingImageData = nextImageData;
      charThumb = nextThumb;
      charName = file.name.replace(/\.[^.]+$/, '');
      hasCharImage = true; charDirty = true;
      updateCharCard(); emitChange();
      fileInput.value = '';
    }

    var reader = new FileReader();
    reader.onload = function(ev) {
      var result = ev && ev.target ? ev.target.result : '';
      nextImageData = (typeof result === 'string') ? result : '';
      imageDataReady = !!nextImageData;
      finalizeIfReady();
    };
    reader.onerror = function() {
      imageDataReady = false;
      fileInput.value = '';
    };
    reader.readAsDataURL(file);

    var blobUrl = URL.createObjectURL(file);
    var img = new window.Image();
    img.onload = function() {
      nextThumb = resizeToDataURL(img, THUMB_SIZE, VIS_Q);
      thumbReady = true;
      URL.revokeObjectURL(blobUrl);
      finalizeIfReady();
    };
    img.onerror = function() {
      thumbReady = true;
      URL.revokeObjectURL(blobUrl);
      finalizeIfReady();
    };
    img.src = blobUrl;
  });

  // ═══════════════════════════════════════════════════════════════════
  // SAVE SCENE — same pattern as CinemaSetupWidgetV18: instant save, chips
  // ═══════════════════════════════════════════════════════════════════
  var sceneSaveBar = document.createElement('div');
  sceneSaveBar.style.cssText = 'display:flex;align-items:center;justify-content:flex-start;gap:10px;padding:10px 24px 8px 24px;background:transparent;';

  var sceneSaveBtn = document.createElement('button');
  sceneSaveBtn.className = 'csw-scene-save';
  sceneSaveBtn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 14px;border:1px solid #555;border-radius:14px;background:rgba(20,25,35,0.6);color:#bbc;font-size:10px;cursor:pointer;';
  sceneSaveBtn.textContent = '+ Save scene';
  sceneSaveBar.appendChild(sceneSaveBtn);

  var presetsHidden = (value && typeof value._presets_hidden === 'boolean') ? value._presets_hidden : false;
  var hidePresetsBtn = document.createElement('button');
  hidePresetsBtn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:5px 14px;border:1px solid #555;border-radius:14px;background:rgba(20,25,35,0.6);color:#bbc;font-size:10px;cursor:pointer;';
  hidePresetsBtn.textContent = presetsHidden ? 'Show presets' : 'Hide presets';
  sceneSaveBar.appendChild(hidePresetsBtn);

  var allCarouselWraps = [];

  hidePresetsBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    presetsHidden = !presetsHidden;
    hidePresetsBtn.textContent = presetsHidden ? 'Show presets' : 'Hide presets';
    allCarouselWraps.forEach(function(w) { w.style.display = presetsHidden ? 'none' : 'block'; });
    emitChange();
  });
  hidePresetsBtn.addEventListener('mouseenter', function() {
    hidePresetsBtn.style.borderColor = '#5588cc';
    hidePresetsBtn.style.color = '#ccddf0';
    hidePresetsBtn.style.background = 'rgba(40,80,140,0.25)';
    hidePresetsBtn.style.boxShadow = '0 0 8px rgba(50,120,220,0.3)';
  });
  hidePresetsBtn.addEventListener('mouseleave', function() {
    hidePresetsBtn.style.borderColor = '#555';
    hidePresetsBtn.style.color = '#bbc';
    hidePresetsBtn.style.background = 'rgba(20,25,35,0.6)';
    hidePresetsBtn.style.boxShadow = 'none';
  });

  var savedScenesEl = document.createElement('div');
  savedScenesEl.style.cssText = 'display:none;gap:6px;padding:4px 24px 4px 24px;overflow-x:auto;background:transparent;min-height:0;scrollbar-width:thin;scrollbar-color:#333 transparent;justify-content:flex-start;';

  function buildSceneLabel(scene) {
    var parts = [];
    sectionKeys.forEach(function(sk) {
      if (!scene.sections || !scene.sections[sk]) return;
      var catKeys = Object.keys(SECTIONS[sk].categories);
      var first = catKeys[0];
      var idx = scene.sections[sk][first] || 0;
      var opt = SECTIONS[sk].categories[first].options[idx];
      if (opt) parts.push(opt.name);
    });
    return parts.join(' / ') || 'Scene';
  }

  function renderSavedScenes() {
    savedScenesEl.innerHTML = '';
    if (savedScenes.length === 0) { savedScenesEl.style.display = 'none'; return; }
    savedScenesEl.style.display = 'flex';
    savedScenes.forEach(function(scene, idx) {
      var chip = document.createElement('div');
      chip.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;' +
        'padding:8px 10px;background:#1c1e26;border:1px solid #3a3e4e;' +
        'border-radius:8px;cursor:pointer;min-width:60px;max-width:160px;flex-shrink:0;position:relative;';
      var sceneName = buildSceneLabel(scene);
      chip.innerHTML =
        '<div style="width:20px;height:20px;color:#8899bb;display:flex;align-items:center;justify-content:center;">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="15" height="13" rx="2"/><polygon points="19,8 23,5 23,19 19,16"/></svg>' +
        '</div>' +
        '<div class="chip-name" style="font-size:9px;font-weight:600;color:#ccddef;text-align:center;line-height:1.3;max-width:150px;overflow:hidden;text-overflow:ellipsis;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">' +
          sceneName + '</div>' +
        '<div data-delidx="' + idx + '" style="position:absolute;top:3px;right:4px;width:18px;height:18px;border-radius:50%;background:rgba(20,20,30,0.85);color:#ff6677;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity 0.15s;border:1px solid #444;">\u00D7</div>';

      chip.addEventListener('mouseenter', function() {
        chip.style.borderColor = '#3399ff';
        chip.style.boxShadow = '0 0 12px #1155bb';
        chip.style.background = '#222638';
        var x = chip.querySelector('[data-delidx]'); if (x) x.style.opacity = '1';
      });
      chip.addEventListener('mouseleave', function() {
        chip.style.borderColor = '#3a3e4e';
        chip.style.boxShadow = 'none';
        chip.style.background = '#1c1e26';
        var x = chip.querySelector('[data-delidx]'); if (x) x.style.opacity = '0';
      });
      chip.addEventListener('click', function(e) {
        e.stopPropagation();
        if (e.target.dataset && e.target.dataset.delidx !== undefined) {
          savedScenes.splice(parseInt(e.target.dataset.delidx), 1);
          renderSavedScenes();
          emitChange();
          return;
        }
        sectionKeys.forEach(function(sk) {
          if (scene.sections && scene.sections[sk]) {
            Object.keys(scene.sections[sk]).forEach(function(ck) {
              if (typeof scene.sections[sk][ck] === 'number') state[sk].selections[ck] = scene.sections[sk][ck];
            });
            var savedPreset = (scene.preset_active && typeof scene.preset_active[sk] === 'number') ? scene.preset_active[sk] : -1;
            var totalPresets = getAllPresets(sk).length;
            if (savedPreset >= 0 && savedPreset < totalPresets) presetState[sk] = savedPreset;
            else presetState[sk] = -1;
            var catKeys = Object.keys(SECTIONS[sk].categories);
            catKeys.forEach(function(ck) { updateCardUI(sk, ck); });
            renderPresetHighlights(sk);
            if (presetState[sk] >= 0) centerPresetThumb(sk, presetState[sk]);
          }
        });
        emitChange();
      });
      savedScenesEl.appendChild(chip);
    });
  }

  sceneSaveBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var scene = { sections: {}, preset_active: {} };
    sectionKeys.forEach(function(sk) {
      scene.sections[sk] = JSON.parse(JSON.stringify(state[sk].selections));
      scene.preset_active[sk] = presetState[sk];
    });
    savedScenes.push(scene);
    renderSavedScenes();
    emitChange();
  });
  sceneSaveBtn.addEventListener('mouseenter', function() {
    sceneSaveBtn.style.borderColor = '#5588cc';
    sceneSaveBtn.style.color = '#ccddf0';
    sceneSaveBtn.style.background = 'rgba(40,80,140,0.25)';
    sceneSaveBtn.style.boxShadow = '0 0 8px rgba(50,120,220,0.3)';
  });
  sceneSaveBtn.addEventListener('mouseleave', function() {
    sceneSaveBtn.style.borderColor = '#555';
    sceneSaveBtn.style.color = '#bbc';
    sceneSaveBtn.style.background = 'rgba(20,25,35,0.6)';
    sceneSaveBtn.style.boxShadow = 'none';
  });


  // ═══════════════════════════════════════════════════════════════════
  // BUILD SECTIONS
  // ═══════════════════════════════════════════════════════════════════
  var sectionEls = {};
  var cardEls = {};
  var charCardEl = null, charImgEl = null;

  function getOpt(sk, ck) {
    var cat = SECTIONS[sk].categories[ck];
    return cat.options[state[sk].selections[ck] || 0];
  }

  function clearAllHighlights() {
    activeCard = null; activeSection = null;
    rootEl.querySelectorAll('[data-scat]').forEach(function(c) {
      c.style.background = '#16161a'; c.style.borderColor = '#2a2a2e'; c.style.boxShadow = 'none';
      var g = c.querySelector('.g'); if (g) g.style.opacity = '0';
      var l = c.querySelector('.l'); if (l) l.style.color = '#666';
      var ic = c.querySelector('.ic'); if (ic) { ic.style.color = '#555'; ic.style.filter = 'none'; }
      var s = c.querySelector('.s'); if (s) s.style.color = '#555';
      var n = c.querySelector('.n'); if (n) { n.style.color = '#ccc'; n.style.textShadow = 'none'; }
      var d = c.querySelector('.d'); if (d) d.style.color = '#555';
      var ar = c.querySelector('.ar'); if (ar) ar.style.opacity = '0';
      var pb = c.querySelector('.cd-pbar'); if (pb) pb.style.opacity = '0.4';
    });
    if (charCardEl) {
      charCardEl.style.borderColor = '#2a2a2e'; charCardEl.style.boxShadow = 'none';
      var cg = charCardEl.querySelector('.g'); if (cg) cg.style.opacity = '0';
    }
  }

  function hideAllToggles() {
    rootEl.querySelectorAll('.cd-toggle').forEach(function(t) {
      t.style.opacity = '0'; t.style.boxShadow = 'none';
    });
  }

  var activeQuickMenu = null;
  function closeQuickMenu() {
    if (!activeQuickMenu) return;
    activeQuickMenu.style.display = 'none';
    activeQuickMenu = null;
  }

  function setCardActive(sk, ck) {
    clearAllHighlights();
    hideAllToggles();
    activeSection = sk; activeCard = ck;
    var c = cardEls[sk + '.' + ck]; if (!c) return;
    var tint = SECTIONS[sk].categories[ck].tint;
    c.style.background = '#0c1228'; c.style.borderColor = '#2266cc';
    c.style.boxShadow = '0 0 12px #1155bb, 0 0 25px #0a3388';
    var g = c.querySelector('.g'); if (g) g.style.opacity = '1';
    var l = c.querySelector('.l'); if (l) l.style.color = '#44aaff';
    var ic = c.querySelector('.ic'); if (ic) { ic.style.color = tint.active; ic.style.filter = 'drop-shadow(0 0 6px ' + tint.glow + ')'; }
    var s = c.querySelector('.s'); if (s) s.style.color = '#44aaff';
    var n = c.querySelector('.n'); if (n) { n.style.color = '#fff'; n.style.textShadow = '0 0 6px #2288ee'; }
    var d = c.querySelector('.d'); if (d) d.style.color = '#4488bb';
    var ar = c.querySelector('.ar'); if (ar) ar.style.opacity = '1';
    var pb = c.querySelector('.cd-pbar'); if (pb) pb.style.opacity = '1';
    var tg = c.querySelector('.cd-toggle'); if (tg) tg.style.opacity = '1';
  }

  function scrollCat(sk, ck, dir) {
    var cat = SECTIONS[sk].categories[ck];
    var idx = state[sk].selections[ck] + dir;
    if (idx < 0) idx = cat.options.length - 1;
    if (idx >= cat.options.length) idx = 0;
    state[sk].selections[ck] = idx;
    presetState[sk] = -1;
    renderPresetHighlights(sk);
    updateCardUI(sk, ck);
    emitChange();
    setCardActive(sk, ck);
  }

  function updateCardUI(sk, ck) {
    var c = cardEls[sk + '.' + ck]; if (!c) return;
    var opt = getOpt(sk, ck);
    var total = SECTIONS[sk].categories[ck].options.length;
    var idx = state[sk].selections[ck];
    var s = c.querySelector('.s'), n = c.querySelector('.n'), d = c.querySelector('.d'), pb = c.querySelector('.cd-pbar');
    if (s) s.textContent = opt.sub || '';
    if (n) n.textContent = opt.name;
    if (d) d.textContent = opt.desc;
    if (pb) pb.style.width = (((idx + 1) / total) * 100).toFixed(1) + '%';
  }

  function applyDisabledVisual(sk, ck) {
    var c = cardEls[sk + '.' + ck]; if (!c) return;
    var isOff = !!state[sk].disabled[ck];
    c.style.opacity = isOff ? '0.3' : '1';
    c.style.cursor = isOff ? 'default' : 'ns-resize';
    var toggle = c.querySelector('.cd-toggle');
    if (toggle) {
      toggle.innerHTML = isOff ? '&#x2715;' : '&#x2713;';
      toggle.style.color = isOff ? '#ff6677' : '#77dd99';
      toggle.style.borderColor = isOff ? '#663333' : '#336644';
      toggle.style.background = isOff ? 'rgba(100,25,25,0.8)' : 'rgba(30,70,40,0.8)';
      toggle.style.boxShadow = 'none';
      toggle.style.opacity = '0';
      toggle.title = isOff ? 'Enable' : 'Disable';
    }
  }

  function updateCharCard() {
    if (!charImgEl) return;
    var lbl = charCardEl ? charCardEl.querySelector('.l') : null;
    if (charThumb) {
      charImgEl.innerHTML = '<img src="' + charThumb + '" style="width:100%;height:100%;object-fit:contain;display:block;" />';
      if (lbl) lbl.style.opacity = '0';
    } else {
      charImgEl.innerHTML = '<div style="color:#444;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg></div>';
      if (lbl) { lbl.style.opacity = '1'; lbl.style.color = '#666'; }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PRESET CAROUSEL + SAVE
  // ═══════════════════════════════════════════════════════════════════
  var presetEls = {};

  function renderPresetHighlights(sk) {
    var cont = presetEls[sk];
    if (!cont) return;
    var customCount = (customPresets[sk] || []).length;
    var hoverLocked = !!cont._hoverLockUntil && Date.now() < cont._hoverLockUntil;
    var isHovering = false; // Disable carousel-wide hover brightening to avoid flicker.
    var thumbs = cont.querySelectorAll('[data-pidx]');
    thumbs.forEach(function(t) {
      var pidx = parseInt(t.dataset.pidx);
      var isA = pidx === presetState[sk];
      var isCust = pidx < customCount;
      t.style.transition = 'none';
      if (isA) {
        t.style.borderColor = isCust ? '#66aa44' : '#3399ff';
        t.style.boxShadow = isCust ? '0 0 10px #335522, 0 0 20px #223311' : '0 0 10px #1155bb, 0 0 20px #0a3388';
        t.style.filter = 'brightness(1)';
      } else {
        t.style.borderColor = isCust ? '#33442a' : '#2a2a2e';
        t.style.boxShadow = 'none';
        t.style.filter = 'brightness(0.5)';
      }
      var lbl = t.querySelector('.pl');
      if (lbl) lbl.style.color = isA ? (isCust ? '#aadda0' : '#55ccff') : '#fff';
    });
  }

  function getAllPresets(sk) {
    return PRESETS[sk] || [];
  }

  function getPresetImageSrc(sk, p) {
    if (!p || p._custom || !p.img) return '';
    return p.folder ? stillUrl(p.folder, p.img) : stillUrlRoot(p.img);
  }

  function warmPresetImage(src, done) {
    if (!src) { if (done) done(); return; }
    var c = presetThumbCache[src];
    if (c && c.loaded) { if (done) done(); return; }
    if (c && c.loading) {
      if (done) c.waiters.push(done);
      return;
    }
    presetThumbCache[src] = { loaded: false, loading: true, waiters: done ? [done] : [] };
    var img = new window.Image();
    img.onload = function() {
      var entry = presetThumbCache[src];
      if (!entry) return;
      entry.loaded = true;
      entry.loading = false;
      var waiters = entry.waiters || [];
      entry.waiters = [];
      waiters.forEach(function(cb) { cb(); });
    };
    img.onerror = function() {
      var entry = presetThumbCache[src];
      if (!entry) return;
      entry.loaded = false;
      entry.loading = false;
      var waiters = entry.waiters || [];
      entry.waiters = [];
      waiters.forEach(function(cb) { cb(); });
    };
    img.src = src;
  }

  function warmSectionPresetImages(sk, done) {
    var allP = getAllPresets(sk);
    var urls = [];
    allP.forEach(function(p) {
      var src = getPresetImageSrc(sk, p);
      if (src) urls.push(src);
    });
    if (urls.length === 0) { if (done) done(); return; }
    var left = urls.length;
    urls.forEach(function(src) {
      warmPresetImage(src, function() {
        left--;
        if (left <= 0 && done) done();
      });
    });
  }

  function centerPresetThumb(sk, idx) {
    var cont = presetEls[sk]; if (!cont) return;
    var reals = cont.querySelectorAll('[data-pidx]:not([data-clone])');
    var thumb = null;
    for (var t = 0; t < reals.length; t++) {
      if (parseInt(reals[t].dataset.pidx) === idx) { thumb = reals[t]; break; }
    }
    if (!thumb) return;
    cont._centering = true;
    var allThumbs = cont.querySelectorAll('[data-pidx]');
    allThumbs.forEach(function(t) { t.style.transition = 'none'; });
    var offset = 0;
    var el = thumb;
    while (el && el !== cont) { offset += el.offsetLeft; el = el.offsetParent; }
    var thumbCenter = offset + thumb.offsetWidth / 2;
    var containerCenter = cont.offsetWidth / 2;
    var targetLeft = thumbCenter - containerCenter;
    // Force non-animated scroll in case host/global CSS enables smooth scrolling.
    cont.style.scrollBehavior = 'auto';
    if (cont.scrollTo) cont.scrollTo({ left: targetLeft, behavior: 'auto' });
    cont.scrollLeft = targetLeft;
    setTimeout(function() { cont._centering = false; }, 40);
  }

  function centerThumbElementImmediate(cont, thumbEl) {
    if (!cont || !thumbEl) return;
    cont._centering = true;
    var offset = 0;
    var el = thumbEl;
    while (el && el !== cont) { offset += el.offsetLeft; el = el.offsetParent; }
    var targetLeft = offset + thumbEl.offsetWidth / 2 - cont.offsetWidth / 2;
    cont.style.scrollBehavior = 'auto';
    if (cont.style.setProperty) cont.style.setProperty('scroll-behavior', 'auto', 'important');
    if (cont.scrollTo) cont.scrollTo({ left: targetLeft, behavior: 'auto' });
    cont.scrollLeft = targetLeft;
    requestAnimationFrame(function() { cont.scrollLeft = targetLeft; });
    setTimeout(function() { cont._centering = false; }, 40);
  }

  function lockCarouselHover(sk, ms) {
    var cont = presetEls[sk];
    if (!cont) return;
    var delay = typeof ms === 'number' ? ms : PRESET_HOVER_REARM_MS;
    cont._hoverLockUntil = Date.now() + delay;
    cont._carouselHover = false;
    cont.querySelectorAll('[data-pidx] img').forEach(function(img) {
      img.style.transform = 'scale(1)';
      img.style.transition = 'none';
    });
    if (cont._hoverRearmTimer) clearTimeout(cont._hoverRearmTimer);
    renderPresetHighlights(sk);
    cont._hoverRearmTimer = setTimeout(function() {
      if (!presetEls[sk] || presetEls[sk] !== cont) return;
      if (Date.now() < cont._hoverLockUntil) return;
      if (cont.matches && cont.matches(':hover')) {
        cont._carouselHover = true;
        renderPresetHighlights(sk);
      }
    }, delay + 20);
  }

  function isPresetFxLocked(sk) {
    var cont = presetEls[sk];
    if (!cont) return false;
    if (cont._centering) return true;
    if (cont._hoverLockUntil && Date.now() < cont._hoverLockUntil) return true;
    return false;
  }

  function applyPreset(sk, idx, clickedThumb) {
    var allPresets = getAllPresets(sk);
    if (!allPresets[idx]) return;
    var p = allPresets[idx];
    Object.keys(p.settings).forEach(function(ck) {
      state[sk].selections[ck] = findIdx(sk, ck, p.settings[ck]);
    });
    presetState[sk] = idx;
    var catKeys = Object.keys(SECTIONS[sk].categories);
    catKeys.forEach(function(ck) {
      state[sk].disabled[ck] = false;
      applyDisabledVisual(sk, ck);
      updateCardUI(sk, ck);
    });
    var cont = presetEls[sk];
    if (cont && clickedThumb) centerThumbElementImmediate(cont, clickedThumb);
    lockCarouselHover(sk, PRESET_HOVER_REARM_MS);
    centerPresetThumb(sk, idx);
    renderPresetHighlights(sk);
    requestAnimationFrame(function() { emitChange(); });
  }

  var sectionSavedEls = {};

  function saveCustomPreset(sk) {
    var settings = {};
    var catKeys = Object.keys(SECTIONS[sk].categories);
    catKeys.forEach(function(ck) {
      settings[ck] = state[sk].selections[ck];
    });
    settings._section = sk;
    settings._disabled = Object.assign({}, state[sk].disabled);
    customPresets[sk].push(settings);
    renderSectionSaved(sk);
    emitChange();
  }

  function buildChipLabel(sk, setup) {
    var catKeys = Object.keys(SECTIONS[sk].categories);
    var parts = [];
    catKeys.forEach(function(ck) {
      if (setup._disabled && setup._disabled[ck]) return;
      var idx = typeof setup[ck] === 'number' ? setup[ck] : 0;
      var opt = SECTIONS[sk].categories[ck].options[idx];
      if (opt) parts.push(opt.name);
    });
    return parts.join(' / ') || 'Setup';
  }

  function renderSectionSaved(sk) {
    var el = sectionSavedEls[sk];
    if (!el) return;
    el.innerHTML = '';
    var saved = customPresets[sk] || [];
    if (saved.length === 0) { el.style.display = 'none'; return; }
    el.style.display = 'flex';
    var catKeys = Object.keys(SECTIONS[sk].categories);
    saved.forEach(function(setup, i) {
      var chip = document.createElement('div');
      chip.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;' +
        'padding:8px 10px;background:#1c1e26;border:1px solid #3a3e4e;' +
        'border-radius:8px;cursor:pointer;min-width:60px;max-width:140px;flex-shrink:0;position:relative;';
      var chipName = buildChipLabel(sk, setup);
      chip.innerHTML =
        '<div class="chip-name" style="font-size:9px;font-weight:600;color:#ccddef;text-align:center;line-height:1.3;max-width:130px;overflow:hidden;text-overflow:ellipsis;word-break:break-word;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">' + chipName + '</div>' +
        '<div data-sidx="' + i + '" style="position:absolute;top:3px;right:4px;width:18px;height:18px;border-radius:50%;background:rgba(20,20,30,0.85);color:#ff6677;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity 0.15s;border:1px solid #444;">\u00D7</div>';
      chip.addEventListener('mouseenter', function() {
        chip.style.borderColor = '#3399ff'; chip.style.boxShadow = '0 0 12px #1155bb';
        chip.style.background = '#222638';
        var x = chip.querySelector('[data-sidx]'); if (x) x.style.opacity = '1';
      });
      chip.addEventListener('mouseleave', function() {
        chip.style.borderColor = '#3a3e4e'; chip.style.boxShadow = 'none';
        chip.style.background = '#1c1e26';
        var x = chip.querySelector('[data-sidx]'); if (x) x.style.opacity = '0';
      });
      chip.addEventListener('click', function(e) {
        e.stopPropagation();
        if (e.target.dataset && e.target.dataset.sidx !== undefined) {
          customPresets[sk].splice(parseInt(e.target.dataset.sidx), 1);
          renderSectionSaved(sk);
          emitChange();
          return;
        }
        catKeys.forEach(function(ck) {
          if (typeof setup[ck] === 'number') state[sk].selections[ck] = setup[ck];
        });
        if (setup._disabled) {
          catKeys.forEach(function(ck) {
            state[sk].disabled[ck] = !!setup._disabled[ck];
            applyDisabledVisual(sk, ck);
          });
        }
        // Loading a section-saved setup is "manual mix"; clear active preset highlight.
        presetState[sk] = -1;
        catKeys.forEach(function(ck) { updateCardUI(sk, ck); });
        renderPresetHighlights(sk);
        emitChange();
      });
      el.appendChild(chip);
    });
  }

  function deleteCustomPreset(sk, globalIdx) {
    if (globalIdx >= 0 && globalIdx < customPresets[sk].length) {
      customPresets[sk].splice(globalIdx, 1);
    }
    presetState[sk] = -1;
    rebuildCarousel(sk);
    renderSectionSaved(sk);
    emitChange();
  }

  function buildThumb(sk, p, globalIdx) {
    var isCustom = !!p._custom;
    var customCount = (customPresets[sk] || []).length;
    var thumb = document.createElement('div');
    thumb.dataset.pidx = globalIdx;
    thumb.className = isCustom ? 'cd-custom-thumb' : '';
    var isActive = globalIdx === presetState[sk];
    thumb.style.cssText = 'flex-shrink:0;width:calc(33.333% - 4px);min-width:120px;' +
      'aspect-ratio:21/9;border-radius:6px;overflow:hidden;cursor:pointer;position:relative;' +
      'border:2px solid ' + (isCustom ? '#33442a' : '#2a2a2e') + ';background:#111;' +
      'filter:brightness(' + (isActive ? '1' : '0.5') + ');';

    var imgSrc = getPresetImageSrc(sk, p);

    var inner = '';
    if (imgSrc) {
      inner = '<img src="' + imgSrc + '" style="width:100%;height:100%;object-fit:cover;display:block;" />';
    } else {
      inner = '<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a2218,#0f1210);display:flex;align-items:center;justify-content:center;">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a6" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>';
    }

    var labelHtml = isCustom
      ? '<span style="color:#aadda0;">&#9733;</span> ' + p.name
      : p.name;

    inner += '<div style="position:absolute;bottom:0;left:0;right:0;padding:4px 6px 3px;background:linear-gradient(transparent,rgba(0,0,0,0.9));pointer-events:none;">' +
      '<div class="pl" style="font-size:9px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 3px rgba(0,0,0,0.8);">' + labelHtml + '</div>' +
      '<div style="font-size:7px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (p.desc || (isCustom ? 'Custom  \u00B7  double-click to rename' : '')) + '</div>' +
    '</div>';

    if (isCustom) {
      inner += '<div class="cd-x" data-del="1">&times;</div>';
    }

    thumb.innerHTML = inner;

    thumb.addEventListener('mouseenter', function() {
      if (isPresetFxLocked(sk)) return;
      thumb.style.transition = 'none';
      thumb.style.filter = 'brightness(1)';
      if (parseInt(thumb.dataset.pidx) !== presetState[sk]) {
        thumb.style.borderColor = isCustom ? '#558833' : '#2266cc';
        thumb.style.boxShadow = isCustom ? '0 0 8px #335522' : '0 0 8px #1155bb';
      }
    });
    thumb.addEventListener('mousemove', function(ev) {
      var img = thumb.querySelector('img'); if (!img) return;
      // Disable parallax transform on mouse move to prevent repaint flicker.
      img.style.transform = 'scale(1)';
      img.style.transition = 'none';
    });
    thumb.addEventListener('mouseleave', function() {
      var img = thumb.querySelector('img');
      if (img) { img.style.transform = 'scale(1)'; img.style.transition = 'transform 0.3s ease-out'; }
      thumb.style.transition = 'none';
      var pidx = parseInt(thumb.dataset.pidx);
      var isA = pidx === presetState[sk];
      var hov = presetEls[sk] && presetEls[sk]._carouselHover;
      thumb.style.filter = isA ? 'brightness(1)' : 'brightness(0.5)';
      var isCust = pidx < (customPresets[sk] || []).length;
      if (!isA) {
        thumb.style.borderColor = isCust ? '#33442a' : '#2a2a2e';
        thumb.style.boxShadow = 'none';
      }
    });
    thumb.addEventListener('click', function(e) {
      e.stopPropagation();
      if (e.target.dataset && e.target.dataset.del) {
        deleteCustomPreset(sk, globalIdx);
        return;
      }
      applyPreset(sk, globalIdx, thumb);
    });

    if (isCustom) {
      thumb.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        var newName = prompt('Rename preset:', p.name);
        if (newName && newName.trim() && newName.trim() !== p.name) {
          p.name = newName.trim();
          rebuildCarousel(sk);
          emitChange();
        }
      });
    }

    return thumb;
  }

  function populateCarousel(sk, carousel) {
    carousel.innerHTML = '';
    var allP = getAllPresets(sk);
    allP.forEach(function(p, i) {
      var t = buildThumb(sk, p, i);
      t.dataset.clone = '1';
      carousel.appendChild(t);
    });
    allP.forEach(function(p, i) {
      carousel.appendChild(buildThumb(sk, p, i));
    });
    allP.forEach(function(p, i) {
      var t = buildThumb(sk, p, i);
      t.dataset.clone = '1';
      carousel.appendChild(t);
    });
  }

  function getSetWidth(sk) {
    var cont = presetEls[sk]; if (!cont) return 0;
    var reals = cont.querySelectorAll('[data-pidx]:not([data-clone])');
    if (reals.length < 1) return 0;
    var first = reals[0];
    var last = reals[reals.length - 1];
    return (last.offsetLeft + last.offsetWidth) - first.offsetLeft + 5;
  }

  function scrollToRealZone(sk) {
    var cont = presetEls[sk]; if (!cont) return;
    var first = cont.querySelector('[data-pidx]:not([data-clone])');
    if (first) cont.scrollLeft = first.offsetLeft - 8;
  }

  function wrapScroll(sk) {
    var cont = presetEls[sk]; if (!cont) return;
    var setW = getSetWidth(sk); if (setW <= 0) return;
    var reals = cont.querySelectorAll('[data-pidx]:not([data-clone])');
    if (reals.length < 1) return;
    var realStart = reals[0].offsetLeft;
    var realEnd = realStart + setW;
    var viewCenter = cont.scrollLeft + cont.clientWidth / 2;
    if (viewCenter >= realEnd) {
      cont.scrollLeft -= setW;
    } else if (viewCenter < realStart) {
      cont.scrollLeft += setW;
    }
  }

  function rebuildCarousel(sk) {
    var cont = presetEls[sk];
    if (!cont) return;
    var rv = (rebuildVersionBySection[sk] || 0) + 1;
    rebuildVersionBySection[sk] = rv;
    warmSectionPresetImages(sk, function() {
      if (rebuildVersionBySection[sk] !== rv) return;
      populateCarousel(sk, cont);
      renderPresetHighlights(sk);
      requestAnimationFrame(function() { scrollToRealZone(sk); });
    });
  }

  function buildCarouselSection(sk, parentEl) {
    var carouselWrap = document.createElement('div');
    carouselWrap.style.display = presetsHidden ? 'none' : 'block';
    allCarouselWraps.push(carouselWrap);

    var saveRow = document.createElement('div');
    saveRow.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:5px 8px 2px 8px;border-top:1px solid rgba(26,51,85,0.25);';

    var secSaveBtn = document.createElement('button');
    secSaveBtn.className = 'csw-section-save';
    secSaveBtn.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 12px;border:1px solid #333;border-radius:12px;background:transparent;color:#778;font-size:9px;cursor:pointer;';
    secSaveBtn.textContent = '+ Save ' + SECTIONS[sk].label.toLowerCase();
    secSaveBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      saveCustomPreset(sk);
    });
    secSaveBtn.addEventListener('mouseenter', function() {
      secSaveBtn.style.borderColor = '#5588cc';
      secSaveBtn.style.color = '#ccddf0';
      secSaveBtn.style.background = 'rgba(40,80,140,0.25)';
      secSaveBtn.style.boxShadow = '0 0 8px rgba(50,120,220,0.3)';
    });
    secSaveBtn.addEventListener('mouseleave', function() {
      secSaveBtn.style.borderColor = '#333';
      secSaveBtn.style.color = '#778';
      secSaveBtn.style.background = 'transparent';
      secSaveBtn.style.boxShadow = 'none';
    });
    saveRow.appendChild(secSaveBtn);
    carouselWrap.appendChild(saveRow);

    var savedEl = document.createElement('div');
    savedEl.style.cssText = 'display:none;gap:6px;padding:4px 12px 4px 12px;overflow-x:auto;background:transparent;min-height:0;scrollbar-width:thin;scrollbar-color:#333 transparent;justify-content:flex-start;';
    carouselWrap.appendChild(savedEl);
    sectionSavedEls[sk] = savedEl;

    var presetsLabel = document.createElement('div');
    presetsLabel.style.cssText = 'padding:8px 12px 2px 12px;font-size:8px;font-weight:700;letter-spacing:2px;color:#556;text-transform:uppercase;';
    presetsLabel.textContent = 'PRESETS';
    carouselWrap.appendChild(presetsLabel);

    var carousel = document.createElement('div');
    carousel.style.cssText = 'display:flex;gap:5px;padding:4px 0 4px 0;overflow-x:auto;background:transparent;scrollbar-width:thin;scrollbar-color:#333 transparent;position:relative;scroll-behavior:auto;';
    carousel.dataset.carousel = sk;

    warmSectionPresetImages(sk);
    populateCarousel(sk, carousel);

    carousel.addEventListener('wheel', function(e) {
      e.preventDefault(); e.stopPropagation();
      carousel.scrollLeft += e.deltaY * 2;
      wrapScroll(sk);
    }, { passive: false });

    carousel.addEventListener('scroll', function() {
      if (carousel._wrapping) return;
      var setW = getSetWidth(sk); if (setW <= 0) return;
      var reals = carousel.querySelectorAll('[data-pidx]:not([data-clone])');
      if (reals.length < 1) return;
      var realStart = reals[0].offsetLeft;
      var realEnd = realStart + setW;
      var viewCenter = carousel.scrollLeft + carousel.clientWidth / 2;
      if (viewCenter >= realEnd || viewCenter < realStart) {
        carousel._wrapping = true;
        if (viewCenter >= realEnd) carousel.scrollLeft -= setW;
        else carousel.scrollLeft += setW;
        setTimeout(function() { carousel._wrapping = false; }, 60);
      }
    });

    carousel.addEventListener('mouseenter', function() {
      if (carousel._centering) return;
      if (carousel._hoverLockUntil && Date.now() < carousel._hoverLockUntil) return;
      carousel._carouselHover = true;
      renderPresetHighlights(sk);
    });
    carousel.addEventListener('mouseleave', function() {
      if (carousel._centering) return;
      carousel._carouselHover = false;
      renderPresetHighlights(sk);
    });

    carouselWrap.appendChild(carousel);
    parentEl.appendChild(carouselWrap);
    presetEls[sk] = carousel;

    renderSectionSaved(sk);
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUILD EACH SECTION
  // ═══════════════════════════════════════════════════════════════════
  rootEl.appendChild(sceneSaveBar);
  rootEl.appendChild(savedScenesEl);

  sectionKeys.forEach(function(sk, secIdx) {
    var sec = SECTIONS[sk];
    var catKeys = Object.keys(sec.categories);

    if (secIdx > 0) {
      var gap = document.createElement('div'); gap.className = 'cd-section-gap';
      rootEl.appendChild(gap);
    }

    var panel = document.createElement('div');
    panel.className = 'cd-panel';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;padding:8px 10px;cursor:pointer;background:transparent;position:relative;';
    header.innerHTML =
      '<div class="cd-arrow" style="font-size:14px;color:#667;transition:transform 0.2s;width:36px;text-align:center;">' + (state[sk].collapsed ? '▸' : '▾') + '</div>' +
      '<div style="flex:1;text-align:center;font-size:10px;font-weight:800;letter-spacing:3px;color:#e0e4ec;text-transform:uppercase;text-shadow:0 0 12px rgba(51,153,255,0.15);">' + sec.label + '</div>' +
      '<div class="cd-sec-disable" data-sdk="' + sk + '" style="font-size:9px;padding:2px 0;border-radius:10px;cursor:pointer;border:1px solid #333;color:#667;background:transparent;letter-spacing:0.5px;user-select:none;width:36px;text-align:center;" title="Disable section">' + (state[sk].sectionOff ? 'OFF' : 'ON') + '</div>';
    panel.appendChild(header);

    var sectionWrap = document.createElement('div');
    sectionWrap.style.display = state[sk].collapsed ? 'none' : 'block';

    header.addEventListener('click', function(e) {
      if (e.target.closest && e.target.closest('.cd-sec-disable')) return;
      e.stopPropagation();
      state[sk].collapsed = !state[sk].collapsed;
      sectionWrap.style.display = state[sk].collapsed ? 'none' : 'block';
      header.querySelector('.cd-arrow').textContent = state[sk].collapsed ? '▸' : '▾';
      emitChange();
    });

    var secToggle = header.querySelector('.cd-sec-disable');
    function applySectionOff() {
      var off = state[sk].sectionOff;
      secToggle.textContent = off ? 'OFF' : 'ON';
      secToggle.style.color = off ? '#ff6666' : '#4a9966';
      secToggle.style.borderColor = off ? '#663333' : '#336644';
      secToggle.style.background = off ? 'rgba(80,20,20,0.4)' : 'rgba(20,60,30,0.3)';
      sectionWrap.style.opacity = off ? '0.25' : '1';
      sectionWrap.style.pointerEvents = off ? 'none' : 'auto';
    }
    secToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      state[sk].sectionOff = !state[sk].sectionOff;
      applySectionOff();
      emitChange();
    });
    secToggle.addEventListener('mouseenter', function() {
      var off = state[sk].sectionOff;
      secToggle.style.borderColor = off ? '#aa4444' : '#3a8855';
      secToggle.style.boxShadow = off ? '0 0 6px rgba(255,60,60,0.3)' : '0 0 6px rgba(50,150,80,0.25)';
    });
    secToggle.addEventListener('mouseleave', function() {
      var off = state[sk].sectionOff;
      secToggle.style.borderColor = off ? '#663333' : '#336644';
      secToggle.style.boxShadow = 'none';
    });
    applySectionOff();

    var cols = catKeys.length + (sec.hasImage ? 1 : 0);
    var body = document.createElement('div');
    body.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:4px;padding:6px;background:transparent;';

    catKeys.forEach(function(ck) {
      var cat = sec.categories[ck];
      var opt = getOpt(sk, ck);
      var total = cat.options.length;
      var idx = state[sk].selections[ck];

      var card = document.createElement('div');
      card.dataset.scat = sk + '.' + ck;
      card.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'padding:8px 4px;background:#16161a;cursor:ns-resize;position:relative;height:140px;' +
        'border:1px solid #2a2a2e;border-radius:8px;overflow:hidden;';
      var isOff = !!state[sk].disabled[ck];
      var hasQuickPick = (sk === 'style');
      card.innerHTML =
        '<div class="g" style="position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border:2px solid #3399ff;border-radius:8px;pointer-events:none;opacity:0;box-shadow:0 0 12px #1155bb,0 0 25px #0a3388;"></div>' +
        '<div class="cd-toggle" data-tsk="' + sk + '" data-tck="' + ck + '" style="position:absolute;top:4px;left:4px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;font-size:12px;font-weight:700;opacity:0;border:1px solid ' + (isOff ? '#663333' : '#336644') + ';background:' + (isOff ? 'rgba(100,25,25,0.8)' : 'rgba(30,70,40,0.8)') + ';color:' + (isOff ? '#ff6677' : '#77dd99') + ';" title="' + (isOff ? 'Enable' : 'Disable') + '">' + (isOff ? '&#x2715;' : '&#x2713;') + '</div>' +
        (hasQuickPick
          ? '<button class="cd-jump-btn" data-jsk="' + sk + '" data-jck="' + ck + '" style="position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:6;font-size:11px;font-weight:700;opacity:0;border:1px solid #2d5ea8;background:rgba(20,60,120,0.9);color:#8cc7ff;padding:0;" title="Quick select">&#9776;</button>' +
            '<div class="cd-jump-menu" style="display:none;position:absolute;top:27px;right:4px;z-index:8;width:108px;max-height:94px;overflow-y:auto;background:rgba(10,15,24,0.98);border:1px solid #2d5ea8;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.55);"></div>'
          : '') +
        '<div class="l" style="font-size:8px;font-weight:700;letter-spacing:1.5px;color:#666;text-transform:uppercase;margin-bottom:3px;height:10px;overflow:hidden;">' + cat.label + '</div>' +
        '<div class="ic" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#555;margin-bottom:2px;flex-shrink:0;">' + cat.icon + '</div>' +
        '<div class="s" style="font-size:7px;font-weight:600;letter-spacing:1px;color:#555;text-transform:uppercase;height:10px;overflow:hidden;">' + (opt.sub || '') + '</div>' +
        '<div class="n" style="font-size:12px;font-weight:700;color:#ccc;text-align:center;line-height:1.2;width:90px;height:28px;display:flex;align-items:center;justify-content:center;overflow:hidden;">' + opt.name + '</div>' +
        '<div class="d" style="font-size:7px;color:#555;text-align:center;max-width:100px;height:18px;line-height:1.2;overflow:hidden;">' + opt.desc + '</div>' +
        '<div class="ar" style="position:absolute;right:3px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:2px;opacity:0;">' +
          '<button data-sk="' + sk + '" data-ck="' + ck + '" data-dir="-1" style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;background:#222;border-radius:3px;color:#3399ff;font-size:8px;cursor:pointer;border:1px solid #333;padding:0;">&#9650;</button>' +
          '<button data-sk="' + sk + '" data-ck="' + ck + '" data-dir="1" style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;background:#222;border-radius:3px;color:#3399ff;font-size:8px;cursor:pointer;border:1px solid #333;padding:0;">&#9660;</button>' +
        '</div>' +
        '<div class="cd-pbar" style="width:' + (((idx + 1) / total) * 100).toFixed(1) + '%;opacity:0.4;"></div>';
      if (isOff) { card.style.opacity = '0.3'; card.style.cursor = 'default'; }

      if (hasQuickPick) {
        var jumpBtn = card.querySelector('.cd-jump-btn');
        var jumpMenu = card.querySelector('.cd-jump-menu');
        cat.options.forEach(function(optItem, optIdx) {
          var mi = document.createElement('button');
          mi.type = 'button';
          mi.dataset.optidx = String(optIdx);
          mi.style.cssText = 'display:block;width:100%;padding:5px 7px;background:transparent;border:0;border-bottom:1px solid rgba(55,80,120,0.4);text-align:left;color:#9eb5cf;font-size:9px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
          mi.textContent = optItem.name;
          mi.addEventListener('mouseenter', function() {
            mi.style.background = 'rgba(30,70,130,0.35)';
            mi.style.color = '#d7ecff';
          });
          mi.addEventListener('mouseleave', function() {
            mi.style.background = 'transparent';
            mi.style.color = '#9eb5cf';
          });
          mi.addEventListener('click', function(ev) {
            ev.stopPropagation();
            if (state[sk].disabled[ck]) return;
            state[sk].selections[ck] = optIdx;
            presetState[sk] = -1;
            updateCardUI(sk, ck);
            renderPresetHighlights(sk);
            setCardActive(sk, ck);
            closeQuickMenu();
            emitChange();
          });
          jumpMenu.appendChild(mi);
        });
        jumpBtn.addEventListener('click', function(ev) {
          ev.stopPropagation();
          if (state[sk].disabled[ck]) return;
          if (activeQuickMenu && activeQuickMenu !== jumpMenu) closeQuickMenu();
          var showing = jumpMenu.style.display === 'block';
          if (showing) closeQuickMenu();
          else { jumpMenu.style.display = 'block'; activeQuickMenu = jumpMenu; }
        });
      }

      card.addEventListener('mouseenter', function() {
        hideAllToggles();
        if (hasQuickPick) {
          var jb = card.querySelector('.cd-jump-btn');
          if (jb) jb.style.opacity = '1';
        }
        if (state[sk].disabled[ck]) {
          clearAllHighlights();
          card.style.opacity = '0.5';
          card.style.borderColor = '#774040';
          card.style.boxShadow = '0 0 10px rgba(255,60,60,0.25)';
          var toggle = card.querySelector('.cd-toggle');
          if (toggle) {
            toggle.style.opacity = '1';
            toggle.style.color = '#ff5566';
            toggle.style.borderColor = '#cc4444';
            toggle.style.background = 'rgba(140,25,25,0.95)';
            toggle.style.boxShadow = '0 0 12px #ff3344, 0 0 24px #dd1122';
          }
        } else {
          setCardActive(sk, ck);
        }
      });
      card.addEventListener('mouseleave', function() {
        if (hasQuickPick) {
          var jb = card.querySelector('.cd-jump-btn');
          if (jb) jb.style.opacity = '0';
          var jm = card.querySelector('.cd-jump-menu');
          if (jm && activeQuickMenu === jm) closeQuickMenu();
        }
        if (state[sk].disabled[ck]) {
          card.style.opacity = '0.3';
          card.style.borderColor = '#2a2a2e';
          card.style.boxShadow = 'none';
        }
      });
      body.appendChild(card);
      cardEls[sk + '.' + ck] = card;
    });

    if (sec.hasImage) {
      var imgCard = document.createElement('div');
      imgCard.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'padding:0;background:#16161a;cursor:pointer;position:relative;height:140px;' +
        'border:1px solid #2a2a2e;border-radius:8px;overflow:hidden;transition:border-color 0.2s,box-shadow 0.2s;';
      imgCard.innerHTML =
        '<div class="g" style="position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border:2px solid #3399ff;border-radius:8px;pointer-events:none;opacity:0;box-shadow:0 0 12px #1155bb,0 0 25px #0a3388;z-index:3;"></div>' +
        '<div class="l" style="position:absolute;top:6px;left:0;right:0;text-align:center;font-size:7px;font-weight:700;letter-spacing:1.5px;color:#666;text-transform:uppercase;z-index:2;pointer-events:none;">CHARACTER</div>' +
        '<div class="char-img" style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:#111;z-index:1;"></div>';
      imgCard.addEventListener('mouseenter', function() {
        clearAllHighlights();
        imgCard.style.borderColor = '#2266cc'; imgCard.style.boxShadow = '0 0 12px #1155bb, 0 0 25px #0a3388';
        imgCard.querySelector('.g').style.opacity = '1';
      });
      imgCard.addEventListener('mouseleave', function() {
        imgCard.style.borderColor = '#2a2a2e'; imgCard.style.boxShadow = 'none';
        imgCard.querySelector('.g').style.opacity = '0';
      });
      imgCard.addEventListener('click', function(e) { e.stopPropagation(); fileInput.click(); });
      body.appendChild(imgCard);
      charCardEl = imgCard;
      charImgEl = imgCard.querySelector('.char-img');
      updateCharCard();
    }

    sectionWrap.appendChild(body);
    buildCarouselSection(sk, sectionWrap);
    panel.appendChild(sectionWrap);
    rootEl.appendChild(panel);
    sectionEls[sk] = { header: header, wrap: sectionWrap, panel: panel, body: body };
  });

  var bottomGap = document.createElement('div'); bottomGap.className = 'cd-section-gap';
  rootEl.appendChild(bottomGap);

  sectionKeys.forEach(function(sk) { renderPresetHighlights(sk); });
  renderSavedScenes();

  requestAnimationFrame(function() {
    sectionKeys.forEach(function(sk) {
      if (presetState[sk] >= 0) {
        centerPresetThumb(sk, presetState[sk]);
      } else if (typeof savedCarouselScroll[sk] === 'number' && savedCarouselScroll[sk] > 0) {
        presetEls[sk].scrollLeft = savedCarouselScroll[sk];
      } else {
        scrollToRealZone(sk);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // EVENTS
  // ═══════════════════════════════════════════════════════════════════
  function stopProp(e) { e.stopPropagation(); }
  rootEl.addEventListener('pointerdown', stopProp);
  rootEl.addEventListener('mousedown', stopProp);
  rootEl.addEventListener('mouseleave', function() { clearAllHighlights(); hideAllToggles(); });

  rootEl.addEventListener('wheel', function(e) {
    var el = e.target;
    while (el && el !== rootEl) {
      if (el.dataset && el.dataset.pidx !== undefined) return;
      if (el.dataset && el.dataset.carousel) return;
      if (el.scrollWidth > el.clientWidth && el.style.overflowX === 'auto') return;
      if (el.dataset && el.dataset.scat) {
        e.preventDefault(); e.stopPropagation();
        var parts = el.dataset.scat.split('.');
        if (!state[parts[0]].disabled[parts[1]]) scrollCat(parts[0], parts[1], e.deltaY > 0 ? 1 : -1);
        return;
      }
      el = el.parentElement;
    }
    e.preventDefault(); e.stopPropagation();
  }, { passive: false });

  rootEl.addEventListener('click', function(e) {
    var el = e.target;
    var quickBtnEl = el.closest ? el.closest('.cd-jump-btn') : null;
    var quickMenuEl = el.closest ? el.closest('.cd-jump-menu') : null;
    if (!quickBtnEl && !quickMenuEl) closeQuickMenu();
    var toggle = el.closest ? el.closest('.cd-toggle') : null;
    if (toggle && toggle.dataset.tsk && toggle.dataset.tck) {
      e.stopPropagation();
      var tsk = toggle.dataset.tsk, tck = toggle.dataset.tck;
      state[tsk].disabled[tck] = !state[tsk].disabled[tck];
      applyDisabledVisual(tsk, tck);
      var isNowOff = !!state[tsk].disabled[tck];
      if (isNowOff) {
        clearAllHighlights();
        var crd = cardEls[tsk + '.' + tck];
        if (crd) { crd.style.opacity = '0.5'; crd.style.borderColor = '#774040'; crd.style.boxShadow = '0 0 10px rgba(255,60,60,0.25)'; }
        toggle.style.opacity = '1';
        toggle.style.color = '#ff5566';
        toggle.style.borderColor = '#cc4444';
        toggle.style.background = 'rgba(140,25,25,0.95)';
        toggle.style.boxShadow = '0 0 12px #ff3344, 0 0 24px #dd1122';
      } else {
        setCardActive(tsk, tck);
      }
      emitChange();
      return;
    }
    if (el.dataset && el.dataset.dir) {
      e.stopPropagation();
      var dsk = el.dataset.sk, dck = el.dataset.ck;
      if (!state[dsk].disabled[dck]) scrollCat(dsk, dck, parseInt(el.dataset.dir));
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // EMIT
  // ═══════════════════════════════════════════════════════════════════
  function emitChange() {
    if (disabled || !onChange) return;
    var payload = {};

    sectionKeys.forEach(function(sk) {
      var sec = SECTIONS[sk];
      var catKeys = Object.keys(sec.categories);
      var setup = {};
      if (!state[sk].sectionOff) {
        catKeys.forEach(function(ck) {
          if (!state[sk].disabled[ck]) {
            var opt = getOpt(sk, ck);
            setup[ck] = { id: opt.id, name: opt.name, sub: opt.sub, desc: opt.desc };
          }
        });
      }
      payload[sk] = {
        selections: Object.assign({}, state[sk].selections),
        disabled: Object.assign({}, state[sk].disabled),
        sectionOff: state[sk].sectionOff,
        setup: setup,
        collapsed: state[sk].collapsed,
        _active_preset: presetState[sk],
        _carousel_scroll: presetEls[sk] ? presetEls[sk].scrollLeft : 0,
      };
    });

    payload.char_thumb = charThumb;
    payload.char_name = charName;
    payload.has_char_image = hasCharImage;

    if (charDirty && pendingImageData) {
      payload.char_image_data = pendingImageData;
      charDirty = false;
      pendingImageData = '';
    }

    var flatCustom = [];
    sectionKeys.forEach(function(sk) {
      (customPresets[sk] || []).forEach(function(cp) { flatCustom.push(cp); });
    });
    payload._custom_presets = flatCustom;
    payload._saved_scenes = savedScenes;
    payload._presets_hidden = presetsHidden;

    onChange(payload);
  }

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD
  // ═══════════════════════════════════════════════════════════════════
  rootEl.style.outline = 'none';
  rootEl.addEventListener('focus', function() { rootEl.style.boxShadow = 'inset 0 0 0 1px #2266cc44'; });
  rootEl.addEventListener('blur', function() { rootEl.style.boxShadow = 'none'; clearAllHighlights(); });

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════
  if (!value || typeof value !== 'object' || !value.style) emitChange();

  return function() {
    rootEl.removeEventListener('pointerdown', stopProp);
    rootEl.removeEventListener('mousedown', stopProp);
  };
}
