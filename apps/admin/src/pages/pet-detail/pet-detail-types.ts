import type { PetDna, PetState, PetSummary } from '../../api/pets';

/**
 * Pet 详情页各 Section 共享的入参。
 */
export interface SectionProps {
  /** 当前 Pet 基础档案。 */
  readonly pet: PetSummary;
  /** Pet 当前状态，可能尚未加载。 */
  readonly state: PetState | null;
  /** Pet 最新 DNA，可能尚未加载。 */
  readonly dna: PetDna | null;
  /** 状态查询的错误信息，未出错时为 null。 */
  readonly stateError: string | null;
  /** DNA 查询的错误信息，未出错时为 null。 */
  readonly dnaError: string | null;
}
