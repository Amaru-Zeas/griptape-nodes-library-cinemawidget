"""Character Generator node."""

import asyncio
import base64
import io
import json
import logging
from typing import Any

from PIL import Image

from griptape.artifacts import ImageArtifact
from griptape.drivers.prompt.griptape_cloud import GriptapeCloudPromptDriver
from griptape.events import TextChunkEvent
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

MODE_LABELS = {
    "generate_scratch": "Generate New",
    "modify_existing": "Modify Existing",
    "reference_style": "Reference Style",
}
RENDER_MODE_LABELS = {
    "single_character": "Single Character",
    "character_sheet": "Character Sheet",
}

DESCRIBE_PROMPT = (
    "Describe this character's visual identity only for image generation. "
    "Start with explicit subject identity/species (e.g., human, capybara, creature type), then body/build traits, "
    "then face/hair, then outfit silhouette/materials/accessories. "
    "Do not describe action, pose, camera, or environment. Keep it to 2-3 sentences."
)

SLOT_DESCRIBE_PROMPT = (
    "Describe the visible design details in this reference image for '{slot_label}'.\n"
    "Focus on practical image-generation descriptors: silhouette/shape, color palette, materials/fabric, construction details, and style cues.\n"
    "Return one rich natural sentence (18-40 words), no labels, no commentary."
)

SYSTEM_PROMPT = """\
You are an expert character concept prompt writer.

Write one production-ready prompt for image generation.
Focus on character design only: identity, wardrobe, accessories, silhouette, and material details.

Do not discuss camera settings, scene location, or cinematic environment unless explicitly requested.
Default visual presentation must be neutral studio style:
- plain seamless medium-gray background
- soft neutral white lighting
- no colored/neon lighting, no dramatic cinematic mood lighting
- no scene props, no environment storytelling elements

CRITICAL CARD-SCOPE RULES:
- Each category is an independent slot.
- If a slot has a reference extraction, use ONLY that slot's details from that extraction.
- Never leak details from one slot into another slot.
- If a slot extraction says NONE, do not invent details for that slot.
- Ignore disabled slots entirely.

Output only the final prompt text with no labels.
"""


class CharacterGeneratorNode(ControlNode):
    """Character Generator node with style/outfit selection and optional reference image."""

    def __init__(self, name: str, metadata: dict[str, Any] | None = None, **kwargs) -> None:
        node_metadata = {
            "category": "CinemaWidget",
            "description": "Character generator with mode-aware prompting and optional reference image.",
        }
        if metadata:
            node_metadata.update(metadata)
        super().__init__(name=name, metadata=node_metadata, **kwargs)
        self.set_initial_node_size(width=1500, height=1700)

        self._cached_vision_img: ImageArtifact | None = None
        self._cached_slot_imgs: dict[str, ImageArtifact] = {}

        self.add_parameter(
            Parameter(
                name="character_setup",
                input_types=["dict"],
                type="dict",
                output_type="dict",
                default_value={},
                tooltip="Character generator setup emitted by the Character Generator widget.",
                allowed_modes={ParameterMode.PROPERTY, ParameterMode.OUTPUT},
                traits={Widget(name="CharacterGeneratorWidgetCacheKiller", library="GTN Cinematic Director")},
            )
        )

        self.add_parameter(
            Parameter(
                name="model",
                input_types=["str"],
                type="str",
                default_value=DEFAULT_MODEL,
                allowed_modes={ParameterMode.INPUT, ParameterMode.PROPERTY},
                tooltip="LLM model for prompt generation.",
                traits={Options(choices=MODEL_CHOICES)},
                ui_options={"display_name": "generator model", "data": MODEL_CHOICES_ARGS},
            )
        )

        self.add_parameter(
            Parameter(
                name="prompt_output",
                output_type="str",
                tooltip="Generated character prompt.",
                allowed_modes={ParameterMode.OUTPUT},
            )
        )

        self.add_parameter(
            Parameter(
                name="character_output",
                output_type="ImageArtifact",
                tooltip="Uploaded reference character image (if provided).",
                allowed_modes={ParameterMode.OUTPUT},
                ui_options={"hide_property": True},
            )
        )

        with ParameterGroup(name="Outputs", collapsed=True) as outputs_group:
            Parameter(
                name="setup_json",
                output_type="str",
                tooltip="Debug JSON of selected character options.",
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
        if fmt in {"jpeg", "png", "webp"}:
            return ImageArtifact(value=img_bytes, width=width, height=height, format=fmt)

        if pil_img.mode not in {"RGB", "RGBA", "L"}:
            pil_img = pil_img.convert("RGBA")
        buf = io.BytesIO()
        pil_img.save(buf, format="PNG")
        return ImageArtifact(value=buf.getvalue(), width=width, height=height, format="png")

    def _describe_image(self, img: ImageArtifact, model: str, api_key: str) -> str:
        logger.info("CharacterGenerator: vision describe %sx%s with %s", img.width, img.height, model)
        driver = GriptapeCloudPromptDriver(model=model, api_key=api_key, stream=False)
        agent = Agent(prompt_driver=driver)
        result = agent.run([DESCRIBE_PROMPT, img])
        return result.output.value

    def _describe_slot_image(self, img: ImageArtifact, slot_label: str, model: str, api_key: str) -> str:
        driver = GriptapeCloudPromptDriver(model=model, api_key=api_key, stream=False)
        agent = Agent(prompt_driver=driver)
        result = agent.run([SLOT_DESCRIBE_PROMPT.format(slot_label=slot_label), img])
        txt = str(result.output.value).strip()
        if not txt:
            return "NONE"
        return txt

    def _mode_intro(self, mode: str, has_reference: bool) -> str:
        if mode == "modify_existing":
            if has_reference:
                return (
                    "Keep the same character identity from the reference while updating the design details."
                )
            return "Design a coherent character update based on the selected details."
        if mode == "reference_style":
            if has_reference:
                return (
                    "Use the reference for style language while creating a new character identity."
                )
            return "Create a new character with a consistent style from the selected details."
        return "Create a brand-new original character from scratch."

    def _build_deterministic_prompt(
        self,
        *,
        mode: str,
        render_mode: str,
        brief: str,
        char_description: str,
        section_map: dict[str, str],
        has_char_image: bool,
    ) -> str:
        def clean(v: str) -> str:
            txt = str(v or "").strip()
            txt = txt.replace("Unspecified.", "").replace("Unspecified", "").strip()
            while "  " in txt:
                txt = txt.replace("  ", " ")
            return txt

        def detail_or_fallback(key: str, fallback: str) -> str:
            val = clean(section_map.get(key, ""))
            return val if val else fallback
        def strip_prefix(detail: str) -> str:
            txt = clean(detail).strip().rstrip(".")
            if ". " in txt:
                head, tail = txt.split(". ", 1)
                if len(head.split()) <= 3 and tail:
                    return tail.strip().rstrip(".")
            return txt

        def none_like(detail: str) -> bool:
            d = clean(detail).lower().rstrip(".")
            return d in {"none", "no head accessory", "no facial hair", "no special accessory"}

        mode_text = self._mode_intro(mode, bool(char_description.strip() or has_char_image))
        style_text = detail_or_fallback("style", "a coherent style language driven by the selected wardrobe and silhouette")
        hair_text = detail_or_fallback("hair", "natural, believable hair detail that fits the overall character silhouette")
        head_text = detail_or_fallback("head_accessory", "none")
        facial_text = detail_or_fallback("facial_hair", "none")
        special_text = detail_or_fallback("special_accessory", "none")
        upper_text = detail_or_fallback("upper_wear", "a structured upper garment with clear tailoring and material definition")
        bottoms_text = detail_or_fallback("bottoms", "matching structured bottoms with clear seams and silhouette logic")
        footwear_text = detail_or_fallback("footwear", "footwear that complements the complete outfit language")

        render_clause = (
            "Create a three-view character turnaround showing front, side profile, and back views of the exact same subject, with consistent anatomy, materials, and wardrobe construction across all views."
            if render_mode == "character_sheet"
            else "Create a single full-body character portrait with the figure fully visible from head to toe."
        )
        mode_clause = {
            "modify_existing": "Preserve the existing character identity while integrating the updated design choices.",
            "reference_style": "Use the reference style language while shaping a distinct but coherent identity.",
            "generate_scratch": "Establish a fresh original identity from the selected design language.",
        }.get(mode, mode_text)
        identity_clause = (
            f"Identity anchor: preserve this exact subject/species and core anatomy: {char_description.strip()}."
            if char_description.strip()
            else (
                "Identity anchor: preserve the uploaded character's core identity and anatomy."
                if has_char_image
                else "Identity anchor: build a coherent new subject from the selected features."
            )
        )
        brief_text = clean(brief)
        brief_clause = f"Honor this user intent: {brief_text}." if brief_text else ""

        head_clause = "no head accessory" if none_like(head_text) else strip_prefix(head_text)
        facial_clause = "no facial hair" if none_like(facial_text) else strip_prefix(facial_text)
        special_clause = "no additional special accessory" if none_like(special_text) else strip_prefix(special_text)

        return (
            f"{render_clause} {mode_clause} {identity_clause} "
            "Use a neutral studio setup with a plain seamless medium-gray background, soft neutral white lighting, no props, no scenery, no neon glow, and no cinematic color grading. "
            f"The style language is {strip_prefix(style_text)}. "
            f"The hair is {strip_prefix(hair_text)}. "
            f"The head accessory is {head_clause}. "
            f"Facial hair is {facial_clause}. "
            f"The special accessory is {special_clause}. "
            f"Upper wear is {strip_prefix(upper_text)}. "
            f"Bottoms are {strip_prefix(bottoms_text)}. "
            f"Footwear is {strip_prefix(footwear_text)}. "
            "Keep every listed element explicit, detailed, and cohesive in a polished production-ready paragraph."
            + (f" {brief_clause}" if brief_clause else "")
        ).strip()

    def _run_generation(self) -> None:
        data = self.get_parameter_value("character_setup") or {}
        model_input = self.get_parameter_value("model") or DEFAULT_MODEL
        if not isinstance(model_input, str) or model_input not in MODEL_CHOICES:
            model_input = DEFAULT_MODEL

        if not isinstance(data, dict):
            self.parameter_output_values["prompt_output"] = "No character setup found. Configure the Character Generator widget first."
            return

        mode = str(data.get("mode") or "generate_scratch")
        mode = mode if mode in MODE_LABELS else "generate_scratch"
        render_mode = str(data.get("render_mode") or "single_character")
        render_mode = render_mode if render_mode in RENDER_MODE_LABELS else "single_character"

        setup = data.get("setup") if isinstance(data.get("setup"), dict) else {}
        card_ref_mode = data.get("card_ref_mode") if isinstance(data.get("card_ref_mode"), dict) else {}
        card_ref_name = data.get("card_ref_name") if isinstance(data.get("card_ref_name"), dict) else {}
        card_ref_thumb = data.get("card_ref_thumb") if isinstance(data.get("card_ref_thumb"), dict) else {}
        card_disabled = data.get("card_disabled") if isinstance(data.get("card_disabled"), dict) else {}
        card_has_image = data.get("card_has_image") if isinstance(data.get("card_has_image"), dict) else {}
        card_image_data = data.get("card_image_data") if isinstance(data.get("card_image_data"), dict) else {}
        brief = str(data.get("character_brief") or "").strip()
        has_char_image = bool(data.get("has_char_image"))

        self.parameter_output_values["character_setup"] = data
        self.parameter_output_values["setup_json"] = json.dumps(
            {
                "mode": mode,
                "render_mode": render_mode,
                "setup": setup,
                "brief": brief,
                "card_ref_mode": card_ref_mode,
                "card_disabled": card_disabled,
            },
            indent=2,
        )

        api_key = GriptapeNodes.SecretsManager().get_secret(API_KEY_ENV_VAR)

        char_description = ""
        vision_img = self._load_image_from_widget(data)
        if vision_img is not None:
            self._cached_vision_img = vision_img
        elif has_char_image and self._cached_vision_img is not None:
            vision_img = self._cached_vision_img

        if vision_img is not None:
            self.parameter_output_values["character_output"] = vision_img
            char_description = self._describe_image(vision_img, model_input, api_key)

        slot_order = [
            ("hair", "Hair"),
            ("head_accessory", "Head Accessory"),
            ("facial_hair", "Facial Hair"),
            ("special_accessory", "Special Accessory"),
            ("upper_wear", "Upper Wear"),
            ("bottoms", "Bottoms"),
            ("footwear", "Footwear"),
        ]

        slot_reference_desc: dict[str, str] = {}
        for slot_key, slot_label in slot_order:
            if bool(card_disabled.get(slot_key)):
                if slot_key in self._cached_slot_imgs:
                    del self._cached_slot_imgs[slot_key]
                continue
            slot_ref_on = bool(card_ref_mode.get(slot_key))
            slot_new_data = card_image_data.get(slot_key)
            slot_img: ImageArtifact | None = None
            if slot_ref_on and isinstance(slot_new_data, str) and slot_new_data.startswith("data:"):
                slot_img = self._load_image_from_widget({"char_image_data": slot_new_data})
                if slot_img is not None:
                    self._cached_slot_imgs[slot_key] = slot_img
            elif slot_ref_on and isinstance(card_ref_thumb.get(slot_key), str) and str(card_ref_thumb.get(slot_key)).startswith("data:"):
                slot_img = self._load_image_from_widget({"char_image_data": card_ref_thumb.get(slot_key)})
                if slot_img is not None:
                    self._cached_slot_imgs[slot_key] = slot_img
            elif slot_ref_on and bool(card_has_image.get(slot_key)) and slot_key in self._cached_slot_imgs:
                slot_img = self._cached_slot_imgs[slot_key]

            if not slot_ref_on and slot_key in self._cached_slot_imgs:
                del self._cached_slot_imgs[slot_key]

            if slot_ref_on and slot_img is not None:
                slot_txt = self._describe_slot_image(slot_img, slot_label, model_input, api_key).strip()
                slot_reference_desc[slot_key] = slot_txt if slot_txt else "NONE"

        if not setup and not brief and not char_description and not slot_reference_desc:
            self.parameter_output_values["prompt_output"] = (
                "No character inputs were provided. Select options in the Character Generator widget first."
            )
            return

        section_lines = []
        section_map: dict[str, str] = {}
        order = [("style", "Style"), *slot_order]
        for key, label in order:
            if bool(card_disabled.get(key)):
                continue
            if bool(card_ref_mode.get(key)):
                ref_txt = str(slot_reference_desc.get(key, "")).strip()
                if ref_txt:
                    section_lines.append(f"- {label} (from category reference image): {ref_txt}")
                    section_map[key] = ref_txt
                    continue

                # Fallback if extraction payload is missing: use user's card reference label.
                ref_name = str(card_ref_name.get(key, "")).strip()
                if ref_name:
                    fallback_txt = f"use the uploaded {label.lower()} reference with key traits from '{ref_name}'"
                    section_lines.append(f"- {label} (user-provided reference): {fallback_txt}")
                    section_map[key] = fallback_txt
                    continue

                # Last fallback in ref mode: keep selected option text rather than inventing.
                v = setup.get(key, {})
                if isinstance(v, dict):
                    name = str(v.get("name") or "Unspecified")
                    desc = str(v.get("desc") or "")
                    fallback_opt = f"{name}. {desc}".strip()
                    section_lines.append(f"- {label} (fallback selected option): {fallback_opt}")
                    section_map[key] = fallback_opt
                continue

            v = setup.get(key, {})
            if isinstance(v, dict):
                name = str(v.get("name") or "Unspecified")
                desc = str(v.get("desc") or "")
                section_lines.append(f"- {label}: {name}. {desc}".strip())
                section_map[key] = f"{name}. {desc}".strip()

        user_message = "CHARACTER GENERATOR BRIEF\n\n"
        user_message += f"Mode: {MODE_LABELS.get(mode, mode)}\n"
        user_message += f"Render output mode: {RENDER_MODE_LABELS.get(render_mode, render_mode)}\n"
        user_message += self._mode_intro(mode, bool(char_description)) + "\n\n"

        if brief:
            user_message += f"Optional user brief: {brief}\n\n"

        if char_description:
            user_message += (
                "Reference image appearance summary (use according to current mode rules):\n"
                f"{char_description}\n\n"
            )

        if slot_reference_desc:
            user_message += (
                "Category-scoped reference extractions:\n"
                "Each extracted line applies ONLY to its matching category; ignore unrelated details from those images.\n"
            )
            for slot_key, slot_label in slot_order:
                if slot_key not in slot_reference_desc:
                    continue
                user_message += f"- {slot_label}: {slot_reference_desc[slot_key]}\n"
            user_message += "\n"

        if section_lines:
            user_message += "Selected character parts:\n" + "\n".join(section_lines) + "\n\n"

        if render_mode == "character_sheet":
            user_message += (
                "Write one dense image-generation prompt (single paragraph, 150-280 words) that requests a 3-view character sheet. "
                "It must explicitly instruct generation of exactly 3 images/views of the SAME character: front view, back view, and side profile view. "
                "Keep outfit, body proportions, hairstyle, accessories, and material details consistent across all 3 views. "
                "Use plain seamless medium-gray background and neutral soft studio lighting only. "
                "No neon glow, no cinematic grading, no background scene elements. "
                "Do not output lists, labels, or commentary. "
                "Strictly respect card scope: each slot only describes its own category."
            )
        else:
            user_message += (
                "Write one dense image-generation prompt (single paragraph, 140-260 words) for a single full-body character image. "
                "Include concrete clothing/material/accessory details and a coherent full-body character design. "
                "Use plain seamless medium-gray background and neutral soft studio lighting only. "
                "No neon glow, no cinematic grading, no background scene elements. "
                "Do not output lists, labels, or commentary. "
                "Strictly respect card scope: each slot only describes its own category."
            )

        final_prompt = self._build_deterministic_prompt(
            mode=mode,
            render_mode=render_mode,
            brief=brief,
            char_description=char_description,
            section_map=section_map,
            has_char_image=has_char_image,
        )
        self.parameter_output_values["prompt_output"] = final_prompt

        logger.info("CharacterGenerator: generated prompt with %s in mode %s", model_input, mode)

    def process(self) -> None:
        self._run_generation()

    async def aprocess(self) -> None:
        await asyncio.sleep(0)
        await asyncio.to_thread(self._run_generation)


class CharacterGeneratorNodeV2(CharacterGeneratorNode):
    """Compatibility alias for cache-busted class-name revisions."""


class CharacterGeneratorNodeV3(CharacterGeneratorNode):
    """Stable class id to bypass stale metadata bindings."""


class CharacterGeneratorNodeFresh(CharacterGeneratorNode):
    """Fresh class id for hard cache bypass in stubborn workflows."""


class CharacterGeneratorNodeBuiltIn(CharacterGeneratorNode):
    """Built-in backend class id for hard cache bypass."""


class CharacterGeneratorNodeBuiltInV2(CharacterGeneratorNode):
    """Built-in backend class id v2 for hard cache bypass."""


class CharacterGeneratorNodeBuiltInV3(CharacterGeneratorNode):
    """Built-in backend class id v3 for hard cache bypass."""


class CharacterGeneratorNodeBuiltInV4(CharacterGeneratorNode):
    """Built-in backend class id v4 for hard cache bypass."""


class CharacterGeneratorNodeBuiltInV5(CharacterGeneratorNode):
    """Built-in backend class id v5 for hard cache bypass."""


class CharacterGeneratorNodeFreshV2(CharacterGeneratorNode):
    """Fresh class id v2 for hard cache bypass."""


class CharacterGeneratorNodeFreshV3(CharacterGeneratorNode):
    """Fresh class id v3 for hard cache bypass."""


class CharacterGeneratorNodeFreshV4(CharacterGeneratorNode):
    """Fresh class id v4 for hard cache bypass."""


class CharacterGeneratorNodeFreshV5(CharacterGeneratorNode):
    """Fresh class id v5 for hard cache bypass."""


class CharacterGeneratorNodeFreshV6(CharacterGeneratorNode):
    """Fresh class id v6 for hard cache bypass."""


class CharacterGeneratorNodeFreshV7(CharacterGeneratorNode):
    """Fresh class id v7 for hard cache bypass."""


class CharacterGeneratorNodeFreshV8(CharacterGeneratorNode):
    """Fresh class id v8 for hard cache bypass."""


class CharacterGeneratorNodeFreshV9(CharacterGeneratorNode):
    """Fresh class id v9 for hard cache bypass."""


class CharacterGeneratorNodeFreshV10(CharacterGeneratorNode):
    """Fresh class id v10 for hard cache bypass."""


class CharacterGeneratorNodeFreshV11(CharacterGeneratorNode):
    """Fresh class id v11 for hard cache bypass."""


class CharacterGeneratorNodeFreshV12(CharacterGeneratorNode):
    """Fresh class id v12 for hard cache bypass."""
