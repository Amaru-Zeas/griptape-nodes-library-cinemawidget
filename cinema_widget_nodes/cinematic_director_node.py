"""Cinematic Director — All-in-one mega node combining Style, Camera, Character, and Environment."""

import io
import json
import logging
import base64
import asyncio
from typing import Any

from PIL import Image

from griptape.artifacts import ImageArtifact
from griptape.drivers.prompt.griptape_cloud import GriptapeCloudPromptDriver
from griptape.events import TextChunkEvent
from griptape.rules import Rule, Ruleset
from griptape.structures import Agent
from griptape.utils import Stream

from griptape_nodes.exe_types.core_types import Parameter, ParameterGroup, ParameterMode
from griptape_nodes.exe_types.node_types import ControlNode
from griptape_nodes.retained_mode.griptape_nodes import GriptapeNodes
from griptape_nodes.traits.options import Options
from griptape_nodes.traits.widget import Widget

logger = logging.getLogger(__name__)

API_KEY_ENV_VAR = "GT_CLOUD_API_KEY"

MODEL_CHOICES_ARGS = [
    {"name": "gpt-5", "icon": "logos/openai.svg", "args": {"stream": True}},
    {"name": "gpt-4.1", "icon": "logos/openai.svg", "args": {"stream": True}},
    {"name": "gpt-4o", "icon": "logos/openai.svg", "args": {"stream": True}},
    {"name": "gpt-4.1-mini", "icon": "logos/openai.svg", "args": {"stream": True}},
    {"name": "claude-sonnet-4-20250514", "icon": "logos/anthropic.svg", "args": {"stream": True, "structured_output_strategy": "tool", "max_tokens": 64000}},
    {"name": "claude-3-7-sonnet", "icon": "logos/anthropic.svg", "args": {"stream": True, "structured_output_strategy": "tool", "max_tokens": 64000}},
    {"name": "gemini-2.5-flash", "icon": "logos/google.svg", "args": {"stream": True}},
    {"name": "gemini-2.5-pro", "icon": "logos/google.svg", "args": {"stream": True}},
    {"name": "gemini-3-pro", "icon": "logos/google.svg", "args": {"stream": True}},
    {"name": "o3-mini", "icon": "logos/openai.svg", "args": {"stream": True}},
]

MODEL_CHOICES = [m["name"] for m in MODEL_CHOICES_ARGS]
DEFAULT_MODEL = "gpt-5"
NODE_RUNTIME_VERSION = "async-run-1"

DESCRIBE_PROMPT = (
    "Describe ONLY this character's physical appearance for an image generation prompt. "
    "Include: species/race, facial features, hair/fur, body type, clothing, accessories, "
    "and distinguishing visual traits. "
    "Do NOT describe their pose, stance, body position, expression, emotion, or what they are doing. "
    "ONLY what they LOOK like — their permanent physical traits, outfit, and gear. "
    "Be concise (2-3 sentences), visual only, no preamble — just the description."
)

SYSTEM_PROMPT = """\
You are the world's greatest prompt architect for AI image and video generation. You combine \
the technical mastery of a veteran cinematographer, the obsessive eye of a colorist, the soul \
of a Pulitzer-winning visual storyteller, and the encyclopedic gear knowledge of a camera \
technician who has shot on every format ever made.

You receive raw selections from four creative departments — STYLE, CAMERA, CHARACTER, and \
ENVIRONMENT. Each provides specific widget settings. Your job: FUSE them into a single, \
staggeringly detailed image-generation prompt that reads like it was written by someone who \
has physically operated every camera and developed every film stock by hand.

═══════════════════════════════════════════════════════════
SECTION-BY-SECTION DEPTH REQUIREMENTS
═══════════════════════════════════════════════════════════

★ STYLE (highest priority — the visual DNA that infuses everything)
  For GENRE: establish the tonal world — what emotional gravity, narrative tension, or \
  atmospheric undercurrent does this genre carry? Weave it as a mood that saturates the \
  entire image, not a label.
  For MEDIUM: describe the physical or digital substrate. If photorealistic, it IS a \
  photograph — no hedging. If oil painting, describe the canvas weave, impasto thickness, \
  palette-knife marks. If anime, describe line weight, cel layering, color fill technique. \
  If watercolor, describe wet-on-wet bleeds, pigment granulation, paper buckle.
  For RENDERING: this is law. Use ONLY the visual language of the selected rendering. \
  "Soft Dreamy" = bloom, halation, glow, diffused edges. "Gritty Textured" = grain, noise, \
  rough surfaces, crushed blacks. "Cel-Shaded" = flat color fills, hard ink outlines, \
  no gradients. "Ultra Cinematic" = Hollywood-grade color science, filmic lift in shadows, \
  controlled highlight roll-off. NEVER mix rendering languages.
  For PALETTE: name specific color relationships. Not "warm colors" but "amber-to-sienna \
  gradient with crushed teal shadows and blown-out golden highlights."

★ CAMERA (second priority — the optical fingerprint)
  For CAMERA BODY: name the sensor format and its visual signature. RED V-RAPTOR = large-format \
  8K VV sensor with organic highlight roll-off. ARRI ALEXA 65 = 6.5K open-gate, unmatched skin \
  rendering, creamy mid-tones. IMAX 65mm = massive negative, hyper-resolving detail, epic \
  breathing room. Each sensor sees the world differently — describe HOW.
  For LENS: go deep into optical character. Spherical Prime = clinical sharpness, neutral \
  rendering, round bokeh. Anamorphic = oval bokeh, horizontal streak flares, barrel mustache \
  distortion, focus breathing. Vintage Anamorphic = warm amber coated flares, softer contrast, \
  hazy halation at wide apertures. Fisheye = extreme curvilinear distortion, edge stretching, \
  circular central bokeh smearing to cat's-eye comets at periphery, lateral chromatic aberration. \
  Tilt-Shift = selective plane of focus, miniature effect, gradual defocus. Describe aberrations: \
  chromatic fringing, coma, astigmatism, field curvature — whatever that lens ACTUALLY does.
  For FOCAL LENGTH: describe the spatial compression or expansion. 14mm = dramatic perspective \
  exaggeration, near objects loom, distorted verticals, vast background inclusion. 85mm = \
  flattened perspective, intimate subject isolation, creamy background separation. 200mm = \
  extreme background compression, stacked planes, telephoto bokeh wash.
  For APERTURE: describe depth of field behavior precisely. f/1.2 = razor-thin focus plane, \
  subject's near eye sharp while far ear dissolves, swirling bokeh, focus fall-off within \
  inches. f/8 = deep hyperfocal sharpness, everything from foreground rocks to distant peaks \
  in crisp resolution. Describe bokeh shape (circular, cat's-eye, busy/smooth) and how it \
  interacts with background specular highlights.
  For FILM STOCK: this is critical — each stock has a unique chemical personality. \
  Portra 400 = warm peachy skin rendering, low contrast, pastel highlights, fine grain, \
  latitude for days, forgiving highlight compression. Velvia 50 = ultra-saturated chrome \
  transparency, crushed shadows, punchy contrast, very fine grain, restrained halation, \
  compressed highlight latitude — hyperreal graphic look. CineStill 800T = tungsten-balanced, \
  red halation bleeding around highlights from removed remjet layer, dreamy glow, visible \
  grain. Tri-X 400 = classic high-contrast silver gelatin, textured grain, rich deep blacks, \
  luminous highlights. Digital Clean = no emulation, neutral linear response. Describe grain \
  structure (fine/coarse, tight/loose), halation behavior, contrast curve, color rendition.

★ CHARACTER (when present — the hero that commands the frame)
  For POSE: don't just name it — choreograph it. "Hero Stand" = weight planted on the back \
  foot, chest open to camera, chin tilted down two degrees so eyes strike upward through brow, \
  arms relaxed but hands alive. "Leaning on Wall" = one shoulder pressed into surface, hip \
  cocked, arms crossed loosely, head tilted to expose neck line. Describe weight distribution, \
  muscle tension, hand position, spine angle, where the character's center of gravity sits.
  For EMOTION: translate the feeling into visible physical symptoms. "Fearful" = dilated pupils \
  catching light, parted lips with shallow breathing visible, tension in the jaw, white \
  knuckles, micro-tremor in the fingers. "Confident" = relaxed brow, measured direct gaze, \
  slight asymmetric smile, shoulders pulled back revealing collarbone. The emotion must be \
  READABLE in a still image through micro-expressions and body language.
  For APPEARANCE (from vision): preserve EXACT physical description. Hair color, texture, \
  length. Skin tone. Clothing items, materials, wear patterns. Scars, tattoos, accessories. \
  These are non-negotiable — reproduce them faithfully.
  CHARACTER should be 30-40% of the total prompt. They are the HERO of the frame.

★ ENVIRONMENT (the world as a living stage)
  For SETTING: build the location with architectural and textural specificity. "City Street" = \
  describe the asphalt sheen, neon reflections in puddles, steam venting from subway grates, \
  fire escapes zigzagging up brick facades, the particular density of pedestrians or emptiness. \
  "Dense Forest" = describe canopy layering, undergrowth density, moss species on bark, \
  how light filters through the leaf lattice, the soil texture underfoot.
  For WEATHER: weather is tactile. "Heavy Rain" = describe rain streak angle, splash \
  dynamics on surfaces, how clothing clings to skin, the curtain of water softening \
  background details, reflection doubling on wet ground. "Fog" = describe density gradient, \
  how it eats color at distance, halation around light sources, moisture beading on surfaces.
  For TIME OF DAY: describe the exact quality of light. "Golden Hour PM" = sun 5-10 degrees \
  above horizon, amber light raking at extreme angles, shadows stretching 10x subject height, \
  warm highlights with cool blue fill in shadows, sky gradient from gold to peach to violet. \
  "Blue Hour" = ambient skylight only, 4000K even illumination, city lights punching warm \
  against cool atmosphere, no hard shadows.
  For LIGHTING: describe the lighting setup like a gaffer's call sheet. "Rembrandt" = key \
  light 45 degrees high and to one side, triangle of light on shadow-side cheek, nose shadow \
  connecting to cheek shadow, 2:1 or 3:1 lighting ratio. "God Rays" = volumetric shafts \
  through atmospheric particulate, visible Tyndall scattering, dust motes catching individual \
  beams, dramatic falloff between lit and shadow zones.

═══════════════════════════════════════════════════════════
FUSION RULES
═══════════════════════════════════════════════════════════

- Your FIRST SENTENCE must anchor the medium and rendering style unambiguously.
- INTERLEAVE sections — don't write style block then camera block then character block. \
  Weave them together so the camera is capturing the character in the environment through \
  the style. The prompt should flow as one unified vision.
- Use SPECIFIC TECHNICAL TERMINOLOGY from each domain — name actual lens aberrations, \
  film chemistry, lighting ratios, color science terms. A prompt architect at your level \
  does not say "nice bokeh" — they say "smooth cat's-eye bokeh with onion-ring longitudinal \
  spherical aberration in the transition zone."
- Create visual CONTRAST and TENSION — light vs dark, stillness vs motion, warmth vs cold, \
  sharp vs soft. Every great image has push-pull.
- Include at least TWO unexpected micro-details that make the image feel real and unique — \
  a specific reflection, a strand of hair catching light, condensation on metal, a lens flare \
  ghosting across the subject's cheek.
- If NO character is provided, do NOT invent or mention any person, figure, or living being.
- If a character IS provided, the pose/emotion selected OVERRIDE any reference image pose.

FORMAT:
- ONE flowing paragraph. No bullets, headers, labels, or preamble.
- Target 250-400 words — technically dense, cinematic, every word earning its place.
- Output ONLY the raw prompt. No explanations, no quotes, no commentary.
"""


class CinematicDirectorNode(ControlNode):
    """Cinematic Director — all-in-one style, camera, character, and environment.

    One mega widget with all four creative departments. Select settings from each,
    optionally load a character reference image. Runs a single smart combiner LLM
    call to produce the final unified prompt.
    """

    def __init__(self, name: str, metadata: dict[str, Any] | None = None, **kwargs) -> None:
        node_metadata = {
            "category": "CinemaWidget",
            "description": "All-in-one cinematic prompt: style + camera + character + environment → combined output",
        }
        if metadata:
            node_metadata.update(metadata)
        super().__init__(name=name, metadata=node_metadata, **kwargs)
        self.set_initial_node_size(width=1800, height=2300)

        self._cached_vision_img: ImageArtifact | None = None

        self.add_parameter(
            Parameter(
                name="director_setup",
                input_types=["dict"],
                type="dict",
                output_type="dict",
                default_value={},
                tooltip="All-in-one cinematic setup — style, camera, character, and environment.",
                allowed_modes={ParameterMode.PROPERTY, ParameterMode.OUTPUT},
                traits={Widget(name="CinematicDirectorWidget", library="GTN Cinematic Director")},
            )
        )

        self.add_parameter(
            Parameter(
                name="model",
                input_types=["str"],
                type="str",
                default_value=DEFAULT_MODEL,
                allowed_modes={ParameterMode.INPUT, ParameterMode.PROPERTY},
                tooltip="LLM model for prompt generation (also used for vision if character image is loaded)",
                traits={Options(choices=MODEL_CHOICES)},
                ui_options={"display_name": "director model", "data": MODEL_CHOICES_ARGS},
            )
        )

        self.add_parameter(
            Parameter(
                name="prompt_output",
                output_type="str",
                tooltip="The unified cinematic prompt — connect to your image/video generator",
                allowed_modes={ParameterMode.OUTPUT},
            )
        )

        self.add_parameter(
            Parameter(
                name="character_output",
                output_type="ImageArtifact",
                tooltip="The loaded character image (if any)",
                allowed_modes={ParameterMode.OUTPUT},
                ui_options={"hide_property": True},
            )
        )

        self.add_parameter(
            Parameter(
                name="runtime_version",
                output_type="str",
                tooltip="Temporary node runtime marker for cache verification",
                allowed_modes={ParameterMode.OUTPUT},
                ui_options={"hide_property": True},
            )
        )

        with ParameterGroup(name="Outputs", collapsed=True) as outputs_group:
            Parameter(
                name="setup_json",
                output_type="str",
                tooltip="Full JSON of all setups",
                allowed_modes={ParameterMode.OUTPUT},
            )
        self.add_node_element(outputs_group)

    def validate_before_node_run(self) -> list[Exception] | None:
        exceptions = []
        try:
            GriptapeNodes.SecretsManager().get_secret(API_KEY_ENV_VAR)
        except Exception as e:
            exceptions.append(e)
        return exceptions if exceptions else None

    def _load_image_from_widget(self, data: dict) -> ImageArtifact | None:
        data_url = data.get("char_image_data", "")
        if not data_url or not data_url.startswith("data:"):
            return None
        try:
            header, b64 = data_url.split(",", 1)
        except ValueError:
            return None

        img_bytes = base64.b64decode(b64)
        mime = header.split(";", 1)[0].replace("data:", "").strip().lower()
        pil_img = Image.open(io.BytesIO(img_bytes))
        width, height = pil_img.size

        format_map = {
            "image/jpeg": "jpeg",
            "image/jpg": "jpeg",
            "image/png": "png",
            "image/webp": "webp",
        }
        fmt = format_map.get(mime)

        # Keep original bytes when format is directly usable, avoiding extra recompression.
        if fmt in {"jpeg", "png", "webp"}:
            return ImageArtifact(value=img_bytes, width=width, height=height, format=fmt)

        # Fallback for uncommon formats: convert once to PNG at original dimensions.
        if pil_img.mode not in {"RGB", "RGBA", "L"}:
            pil_img = pil_img.convert("RGBA")
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        return ImageArtifact(value=buf.getvalue(), width=width, height=height, format="png")

    def _describe_image(self, img: ImageArtifact, model: str, api_key: str) -> str:
        logger.info(f"CinematicDirector: vision describe {img.width}x{img.height} with {model}")
        driver = GriptapeCloudPromptDriver(model=model, api_key=api_key, stream=False)
        agent = Agent(prompt_driver=driver)
        result = agent.run([DESCRIBE_PROMPT, img])
        desc = result.output.value
        logger.info(f"CinematicDirector: vision → {desc[:200]}")
        return desc

    def _run_generation(self) -> None:
        data = self.get_parameter_value("director_setup") or {}
        model_input = self.get_parameter_value("model") or DEFAULT_MODEL
        self.parameter_output_values["runtime_version"] = NODE_RUNTIME_VERSION
        if not isinstance(model_input, str) or model_input not in MODEL_CHOICES:
            model_input = DEFAULT_MODEL

        style_data = data.get("style", {}) if isinstance(data.get("style"), dict) else {}
        camera_data = data.get("camera", {}) if isinstance(data.get("camera"), dict) else {}
        character_data = data.get("character", {}) if isinstance(data.get("character"), dict) else {}
        environment_data = data.get("environment", {}) if isinstance(data.get("environment"), dict) else {}

        style_setup = style_data.get("setup", {}) if not style_data.get("sectionOff") else {}
        camera_setup = camera_data.get("setup", {}) if not camera_data.get("sectionOff") else {}
        character_setup = character_data.get("setup", {}) if not character_data.get("sectionOff") else {}
        environment_setup = environment_data.get("setup", {}) if not environment_data.get("sectionOff") else {}

        full_json = {
            "style": style_setup,
            "camera": camera_setup,
            "character": character_setup,
            "environment": environment_setup,
        }
        self.parameter_output_values["director_setup"] = data
        self.parameter_output_values["setup_json"] = json.dumps(full_json, indent=2)

        has_any = style_setup or camera_setup or character_setup or environment_setup
        if not has_any:
            self.parameter_output_values["prompt_output"] = "No setup detected. Use the widget to configure style, camera, character, and environment."
            return

        api_key = GriptapeNodes.SecretsManager().get_secret(API_KEY_ENV_VAR)

        char_description = None
        vision_img = None
        if isinstance(data, dict):
            new_img = self._load_image_from_widget(data)
            if new_img is not None:
                self._cached_vision_img = new_img
                vision_img = new_img
            elif data.get("has_char_image") and self._cached_vision_img is not None:
                vision_img = self._cached_vision_img

        if vision_img is not None:
            self.parameter_output_values["character_output"] = vision_img
            char_description = self._describe_image(vision_img, model_input, api_key)

        def _val(setup, key):
            v = setup.get(key, {})
            if isinstance(v, dict):
                return v.get("name", ""), v.get("sub", ""), v.get("desc", ""), v.get("id", "")
            return "", "", "", ""

        pieces = []

        if style_setup:
            gn, gs, gd, gi = _val(style_setup, "genre")
            mn, ms, md, mi = _val(style_setup, "medium")
            rn, rs, rd, ri = _val(style_setup, "rendering")
            pn, ps, pd, pi = _val(style_setup, "palette")
            pieces.append(
                f"═══ STYLE (HIGHEST PRIORITY — THE VISUAL DNA) ═══\n"
                f"  GENRE: {gn} [{gs}] — {gd}\n"
                f"    → Infuse the ENTIRE image with the tonal gravity and narrative tension of {gn}.\n"
                f"  MEDIUM: {mn} [{ms}] — {md}\n"
                f"    → This IS the physical/digital substrate. Describe its material characteristics.\n"
                f"  RENDERING: {rn} [{rs}] — {rd}\n"
                f"    → THIS IS LAW. Use ONLY the visual language of '{rn}'. Do NOT mix in other rendering techniques.\n"
                f"  COLOR PALETTE: {pn} [{ps}] — {pd}\n"
                f"    → Name specific color relationships: what hues dominate highlights, midtones, shadows."
            )

        if camera_setup:
            cn, cs, cd, ci = _val(camera_setup, "camera")
            ln, ls, ld, li = _val(camera_setup, "lens")
            fn, fs, fd, fi = _val(camera_setup, "focal")
            an, asub, ad, ai = _val(camera_setup, "aperture")
            fln, fls, fld, fli = _val(camera_setup, "filmstock")
            pieces.append(
                f"═══ CAMERA (OPTICAL FINGERPRINT — GO DEEP) ═══\n"
                f"  CAMERA BODY: {cn} [{cs}] — {cd}\n"
                f"    → Describe this sensor's unique imaging signature: format size, highlight roll-off, color science.\n"
                f"  LENS: {ln} [{ls}] — {ld}\n"
                f"    → Describe optical character: bokeh shape, flare behavior, aberrations (chromatic, coma, field curvature), contrast rendering.\n"
                f"  FOCAL LENGTH: {fn}{fs} — {fd}\n"
                f"    → Describe spatial compression/expansion, perspective distortion, background relationship.\n"
                f"  APERTURE: {an} — {ad}\n"
                f"    → Describe depth of field behavior: focus plane thickness, bokeh quality, specular highlight rendering.\n"
                f"  FILM STOCK: {fln} [{fls}] — {fld}\n"
                f"    → Describe this stock's chemical personality: grain structure, halation, contrast curve, color rendition, highlight/shadow latitude."
            )

        if character_setup or char_description:
            pn, ps, pd, pi = _val(character_setup, "pose")
            en, es, ed, ei = _val(character_setup, "emotion")
            char_block = (
                f"═══ CHARACTER (THE HERO — 30-40% OF PROMPT) ═══\n"
                f"  POSE: {pn} [{ps}] — {pd}\n"
                f"    → Choreograph this: weight distribution, spine angle, hand positions, muscle tension, center of gravity.\n"
                f"  EMOTION: {en} [{es}] — {ed}\n"
                f"    → Translate to VISIBLE physical symptoms: micro-expressions, eye behavior, mouth tension, body language tells."
            )
            if char_description:
                char_block += (
                    f"\n  CHARACTER APPEARANCE (preserve EXACTLY — non-negotiable):\n"
                    f"    {char_description}"
                )
            char_block += (
                f"\n  ★ CRITICAL: Place this character INTO the '{pn}' pose radiating '{en}' emotion. "
                f"The selected pose/emotion OVERRIDE whatever the reference image shows."
            )
            pieces.append(char_block)

        if environment_setup:
            sn, ss, sd, si = _val(environment_setup, "setting")
            wn, ws, wd, wi = _val(environment_setup, "weather")
            tn, ts, td, ti = _val(environment_setup, "timeofday")
            ltn, lts, ltd, lti = _val(environment_setup, "lighting")
            pieces.append(
                f"═══ ENVIRONMENT (THE LIVING STAGE) ═══\n"
                f"  SETTING: {sn} [{ss}] — {sd}\n"
                f"    → Build this location with architectural/textural specificity: materials, surfaces, spatial depth, atmosphere.\n"
                f"  WEATHER: {wn} [{ws}] — {wd}\n"
                f"    → Weather is tactile: describe how it interacts with surfaces, clothing, light, visibility.\n"
                f"  TIME OF DAY: {tn} [{ts}] — {td}\n"
                f"    → Describe the exact quality of light: sun angle, color temperature, shadow behavior, sky gradient.\n"
                f"  LIGHTING: {ltn} [{lts}] — {ltd}\n"
                f"    → Describe like a gaffer's call sheet: key direction, lighting ratio, fill source, rim/accent, shadow quality."
            )

        user_message = "══════════════════════════════════════\n"
        user_message += "CREATIVE BRIEF — FUSE INTO ONE PROMPT\n"
        user_message += "══════════════════════════════════════\n\n"

        if style_setup:
            rn = _val(style_setup, "rendering")[0]
            mn = _val(style_setup, "medium")[0]
            gn = _val(style_setup, "genre")[0]
            pn = _val(style_setup, "palette")[0]
            user_message += (
                f"★ PRIME DIRECTIVE: The rendering is '{rn}' in '{mn}' medium with '{pn}' palette "
                f"for a '{gn}' genre piece. Every word you write must be filtered through this visual DNA. "
                f"Use ONLY the visual language of '{rn}' — do NOT introduce techniques from any other rendering style.\n\n"
            )

        if character_setup or char_description:
            user_message += "★ CHARACTER IS THE HERO: dedicate 30-40% of the prompt to pose, emotion, body language, and appearance. Do NOT bury them.\n\n"
        else:
            user_message += "★ NO CHARACTER PROVIDED: Do NOT invent or mention any person, figure, or living being.\n\n"

        active_departments = []
        if style_setup:
            active_departments.append("STYLE")
        if camera_setup:
            active_departments.append("CAMERA")
        if character_setup or char_description:
            active_departments.append("CHARACTER")
        if environment_setup:
            active_departments.append("ENVIRONMENT")

        if not active_departments:
            self.parameter_output_values["prompt_output"] = (
                "No active sections selected. Enable at least one section (Style, Camera, Character, or Environment)."
            )
            return

        user_message += (
            "★ STRICT DEPARTMENT GATING (CRITICAL):\n"
            f"Only use departments that are ACTIVE in this run: {', '.join(active_departments) if active_departments else 'NONE'}.\n"
            "Do NOT infer, invent, or reference values from any inactive/missing department.\n"
            "If only one department is active, the final prompt must focus only on that department's information.\n\n"
        )

        inactive_rules = []
        if "STYLE" not in active_departments:
            inactive_rules.append(
                "- STYLE is INACTIVE: do NOT mention genre, medium, rendering style, palette strategy, or named art movements."
            )
        if "CAMERA" not in active_departments:
            inactive_rules.append(
                "- CAMERA is INACTIVE: do NOT mention camera body/sensor, lens model/type, focal length, aperture, film stock, bokeh, depth of field, or optical artifacts."
            )
        if "CHARACTER" not in active_departments:
            inactive_rules.append(
                "- CHARACTER is INACTIVE: do NOT mention any person, figure, body, face, expression, pose, clothing, or living being."
            )
        if "ENVIRONMENT" not in active_departments:
            inactive_rules.append(
                "- ENVIRONMENT is INACTIVE: do NOT mention location/setting, architecture, weather, time-of-day, atmosphere, or scene-building context."
            )

        if inactive_rules:
            user_message += "★ INACTIVE DEPARTMENT EXCLUSIONS (MANDATORY):\n"
            user_message += "\n".join(inactive_rules)
            user_message += "\n\n"

        user_message += "RAW SELECTIONS FROM EACH DEPARTMENT:\n\n"
        user_message += "\n\n".join(pieces)
        user_message += (
            "\n\n══════════════════════════════════════\n"
            "Now fuse ALL of the above into a single, staggeringly detailed image-generation prompt. "
            "Interleave only ACTIVE departments — do not introduce inactive domains. "
            "Write one paragraph (250-400 words), no labels. "
            f"If exactly one department is active ({active_departments[0] if len(active_departments) == 1 else 'N/A'}), keep the prompt strictly about that department only. GO."
        )

        args = next((m["args"] for m in MODEL_CHOICES_ARGS if m["name"] == model_input), {})
        args = {k: v for k, v in args.items() if v is not None}

        driver = GriptapeCloudPromptDriver(model=model_input, api_key=api_key, **args)
        agent = Agent(
            prompt_driver=driver,
            rulesets=[Ruleset(name="CinematicDirector", rules=[Rule(value=SYSTEM_PROMPT)])],
        )

        self.parameter_output_values["prompt_output"] = ""
        for artifact in Stream(agent, event_types=[TextChunkEvent]).run(user_message):
            self.append_value_to_parameter("prompt_output", artifact.value)

        logger.info(f"CinematicDirector: generated combined prompt with {model_input}")

    def process(self) -> None:
        self._run_generation()

    async def aprocess(self) -> None:
        # Keep the async event loop responsive so GTN can display running state.
        await asyncio.sleep(0)
        await asyncio.to_thread(self._run_generation)
