import type { PetDnaDraft } from '@momo/shared';
import type { ManualPetDnaDraft } from '../types';

/**
 * 将 AI Pet DNA 草稿转换为手动确认表单草稿。
 *
 * 前置条件：AI 草稿已通过后端基础校验。后置条件：返回可编辑的扁平表单模型。
 */
export function toManualDna(aiDraft: PetDnaDraft): ManualPetDnaDraft {
  return {
    name: aiDraft.name,
    species: aiDraft.species,
    breed: aiDraft.breed,
    primaryColor: aiDraft.appearance.primaryColor,
    pattern: aiDraft.appearance.pattern,
    eyeColor: aiDraft.appearance.eyeColor,
    personality: aiDraft.personality.primary,
    energyLevel: aiDraft.personality.energyLevel,
    favoriteFoods: aiDraft.preferences.favoriteFoods.join(','),
    dislikedThings: aiDraft.preferences.dislikedThings.join(','),
    catchphrases: aiDraft.voice.catchphrases.join('\n'),
  };
}

/**
 * 将手动确认表单草稿转换为后端 Pet DNA 请求模型。
 *
 * 前置条件：用户已在确认页完成检查。后置条件：返回符合 MVP API 的 Pet DNA 草稿。
 */
export function toPetDnaDraft(dna: ManualPetDnaDraft): PetDnaDraft {
  return {
    name: dna.name,
    species: dna.species,
    breed: dna.breed,
    appearance: {
      primaryColor: dna.primaryColor,
      pattern: dna.pattern,
      eyeColor: dna.eyeColor,
    },
    personality: {
      primary: dna.personality,
      energyLevel: dna.energyLevel,
    },
    preferences: {
      favoriteFoods: splitList(dna.favoriteFoods),
      dislikedThings: splitList(dna.dislikedThings),
    },
    voice: {
      catchphrases: splitList(dna.catchphrases),
    },
    generation: {
      source: 'MIXED',
    },
  };
}

function splitList(value: string): string[] {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
