"""
Translation Files Endpoint
Provides public reads for Next.js i18n dynamic sync,
and protected writes for Admin CMS.
"""
import copy
import hashlib
import json
from pathlib import Path
from typing import Any, Dict, Tuple

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.endpoints.admin import verify_admin_token
from app.api.v1.schemas.admin import ContentResponse, ContentUpdateResponse
from app.db.database import get_db
from app.db.models import SiteTranslation

router = APIRouter()

# Paths for seed/backup translations
BACKEND_DATA_DIR = Path(__file__).parent.parent.parent.parent / "data" / "messages"
FRONTEND_MESSAGES_DIR = Path(__file__).parent.parent.parent.parent.parent.parent / "frontend" / "messages"


def _read_seed_file(lang: str) -> Tuple[Dict[str, Any], str]:
    """Read seed JSON and its SHA-256 digest from backend data or frontend messages."""
    for folder in [BACKEND_DATA_DIR, FRONTEND_MESSAGES_DIR]:
        candidate = folder / f"{lang}.json"
        if candidate.exists():
            try:
                raw = candidate.read_bytes()
                digest = hashlib.sha256(raw).hexdigest()[:16]
                return json.loads(raw.decode("utf-8")), digest
            except Exception:
                pass
    return {}, ""


def _mirror_to_disk(lang: str, data: Dict[str, Any]) -> str:
    """Best-effort write to local JSON files if accessible; returns updated digest."""
    clean_data = {k: v for k, v in data.items() if k != "_seed_hash"}
    serialized = json.dumps(clean_data, ensure_ascii=False, indent=4).encode("utf-8")
    digest = hashlib.sha256(serialized).hexdigest()[:16]
    for folder in [BACKEND_DATA_DIR, FRONTEND_MESSAGES_DIR]:
        if folder.exists():
            try:
                target = folder / f"{lang}.json"
                target.write_bytes(serialized)
            except Exception:
                pass
    return digest


async def _get_or_create_translation(lang: str, db: AsyncSession) -> SiteTranslation:
    """Get translation row from DB, syncing automatically when seed files change on deploy."""
    seed_content, seed_hash = _read_seed_file(lang)
    result = await db.execute(select(SiteTranslation).where(SiteTranslation.lang == lang))
    row = result.scalars().first()
    if row is None:
        stored = {**seed_content, "_seed_hash": seed_hash} if seed_hash else seed_content
        row = SiteTranslation(lang=lang, content=stored)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    elif seed_hash and (row.content or {}).get("_seed_hash") != seed_hash:
        row.content = {**seed_content, "_seed_hash": seed_hash}
        await db.commit()
        await db.refresh(row)
    return row


@router.get("/{lang}", response_model=ContentResponse)
async def get_translations(
    lang: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all translations for a language (tr or en).
    Public endpoint for Next.js frontend sync and Admin CMS.
    """
    if lang not in ["tr", "en"]:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dil. 'tr' veya 'en' kullanın.")

    row = await _get_or_create_translation(lang, db)
    public_content = {k: v for k, v in (row.content or {}).items() if k != "_seed_hash"}
    return ContentResponse(content=public_content)


@router.put("/{lang}", response_model=ContentUpdateResponse)
async def update_translations(
    lang: str,
    data: dict,
    admin: dict = Depends(verify_admin_token),
    db: AsyncSession = Depends(get_db)
):
    """Update entire translations JSON for a language."""
    if lang not in ["tr", "en"]:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dil. 'tr' veya 'en' kullanın.")

    row = await _get_or_create_translation(lang, db)
    digest = _mirror_to_disk(lang, data)
    clean_data = {k: v for k, v in data.items() if k != "_seed_hash"}
    row.content = {**clean_data, "_seed_hash": digest}
    await db.commit()

    return ContentUpdateResponse(
        success=True,
        message=f"'{lang}.json' başarıyla güncellendi"
    )


@router.put("/{lang}/section/{section}", response_model=ContentUpdateResponse)
async def update_section(
    lang: str,
    section: str,
    data: dict,
    admin: dict = Depends(verify_admin_token),
    db: AsyncSession = Depends(get_db)
):
    """Update a specific section in translations."""
    if lang not in ["tr", "en"]:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dil. 'tr' veya 'en' kullanın.")

    row = await _get_or_create_translation(lang, db)
    content = {k: v for k, v in copy.deepcopy(row.content or {}).items() if k != "_seed_hash"}
    content[section] = data
    digest = _mirror_to_disk(lang, content)
    row.content = {**content, "_seed_hash": digest}
    await db.commit()

    return ContentUpdateResponse(
        success=True,
        message=f"'{lang}.json' - '{section}' bölümü güncellendi"
    )


@router.put("/{lang}/field", response_model=ContentUpdateResponse)
async def update_field(
    lang: str,
    request: dict,
    admin: dict = Depends(verify_admin_token),
    db: AsyncSession = Depends(get_db)
):
    """Update a nested field using dot notation path (e.g. 'hero.title')."""
    if lang not in ["tr", "en"]:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dil. 'tr' veya 'en' kullanın.")

    path = request.get("path", "").strip()
    value = request.get("value")

    if not path:
        raise HTTPException(status_code=400, detail="Path belirtilmelidir.")

    row = await _get_or_create_translation(lang, db)
    content = {k: v for k, v in copy.deepcopy(row.content or {}).items() if k != "_seed_hash"}

    keys = path.split(".")
    curr = content
    for key in keys[:-1]:
        if key not in curr or not isinstance(curr[key], dict):
            curr[key] = {}
        curr = curr[key]

    curr[keys[-1]] = value
    digest = _mirror_to_disk(lang, content)
    row.content = {**content, "_seed_hash": digest}
    await db.commit()

    return ContentUpdateResponse(
        success=True,
        message=f"'{lang}.json' - '{path}' güncellendi"
    )
