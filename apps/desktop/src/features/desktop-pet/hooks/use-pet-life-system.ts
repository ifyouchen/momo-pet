import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PetState } from '@momo/shared';
import type { PetLifeBehavior, PetLifeDirection, PetVisualAction } from '../types';
import {
  getPetWindowPlacement,
  isDesktopRuntime,
  setPetWindowPosition,
} from '../runtime/desktop-runtime-api';
import { chooseNextBehavior, getVisualActionForBehavior } from '../runtime/pet-life-behavior';
import {
  DESKTOP_WALK_STEP_PX,
  PREVIEW_WALK_BOUNDARY_PX,
  PREVIEW_WALK_STEP_PX,
  getLaneY,
} from '../runtime/pet-life-layout';
import { getDueReminderMessage } from '../runtime/pet-life-reminder';

const WORK_SESSION_STARTED_AT_KEY = 'momo.workSessionStartedAt';
const LAST_REST_REMINDER_AT_KEY = 'momo.lastRestReminderAt';
const BEHAVIOR_INTERVAL_MS = 12000;
const MOVEMENT_INTERVAL_MS = 1400;

interface UsePetLifeSystemOptions {
  /** 当前宠物状态，影响睡觉、玩耍等自主行为权重。 */
  readonly state: PetState | null;
  /** 用户正在交互时暂停自主生活行为，避免干扰。 */
  readonly isPaused: boolean;
}

export interface PetLifeSystemModel {
  /** 当前自主生活行为。 */
  readonly behavior: PetLifeBehavior;
  /** 当前自主行为映射到的现有单帧视觉动作。 */
  readonly visualAction: PetVisualAction | null;
  /** 自主提醒文案；为空表示不抢占气泡。 */
  readonly reminderMessage: string | null;
  /** 浏览器预览中的模拟位移，Tauri 原生运行时为空对象。 */
  readonly previewStyle: CSSProperties;
  /** 当前移动方向，用于 CSS 翻转和动效。 */
  readonly direction: PetLifeDirection;
}

/**
 * 驱动透明桌宠的自主生活行为。
 *
 * 前置条件：仅由透明桌宠窗口调用。后置条件：在非交互时低频切换行为并移动原生窗口。
 */
export function usePetLifeSystem({ state, isPaused }: UsePetLifeSystemOptions): PetLifeSystemModel {
  const [behavior, setBehavior] = useState<PetLifeBehavior>('idle');
  const [direction, setDirection] = useState<PetLifeDirection>('left');
  const [lane, setLane] = useState<'top' | 'bottom'>('bottom');
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [previewOffsetX, setPreviewOffsetX] = useState(0);
  const directionRef = useRef<PetLifeDirection>('left');
  const laneRef = useRef<'top' | 'bottom'>('bottom');

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    laneRef.current = lane;
  }, [lane]);

  useEffect(() => {
    ensureWorkSessionStarted();
  }, []);

  useEffect(() => {
    if (isPaused) {
      setBehavior('idle');
      setReminderMessage(null);
      return undefined;
    }
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const startedAt = readNumber(WORK_SESSION_STARTED_AT_KEY) ?? now;
      const lastReminderAt = readNumber(LAST_REST_REMINDER_AT_KEY) ?? 0;
      const reminder = getDueReminderMessage(now, startedAt, lastReminderAt);
      if (reminder) {
        setBehavior('remind');
        setReminderMessage(reminder);
        saveNumber(LAST_REST_REMINDER_AT_KEY, now);
        return;
      }
      setReminderMessage(null);
      const nextBehavior = chooseNextBehavior(state);
      setBehavior(nextBehavior);
      if (nextBehavior === 'walk') {
        setLane(Math.random() > 0.28 ? 'bottom' : 'top');
      }
    }, BEHAVIOR_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [isPaused, state]);

  useEffect(() => {
    if (isPaused || behavior !== 'walk') {
      return undefined;
    }
    const intervalId = window.setInterval(() => {
      if (isDesktopRuntime()) {
        void moveNativePetWindow(directionRef.current, laneRef.current, setDirection);
        return;
      }
      setPreviewOffsetX((currentOffset) => {
        const step =
          directionRef.current === 'right' ? PREVIEW_WALK_STEP_PX : -PREVIEW_WALK_STEP_PX;
        const nextOffset = currentOffset + step;
        if (nextOffset >= PREVIEW_WALK_BOUNDARY_PX) {
          setDirection('left');
          return PREVIEW_WALK_BOUNDARY_PX;
        }
        if (nextOffset <= -PREVIEW_WALK_BOUNDARY_PX) {
          setDirection('right');
          return -PREVIEW_WALK_BOUNDARY_PX;
        }
        return nextOffset;
      });
    }, MOVEMENT_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [behavior, isPaused]);

  const previewStyle = useMemo(
    () =>
      isDesktopRuntime()
        ? {}
        : ({
            '--pet-life-preview-x': `${previewOffsetX}px`,
            '--pet-life-preview-y': lane === 'top' ? '-34px' : '0px',
          } as CSSProperties),
    [lane, previewOffsetX],
  );

  return {
    behavior,
    visualAction: getVisualActionForBehavior(behavior),
    reminderMessage,
    previewStyle,
    direction,
  };
}

async function moveNativePetWindow(
  direction: PetLifeDirection,
  lane: 'top' | 'bottom',
  setDirection: (direction: PetLifeDirection) => void,
): Promise<void> {
  const placement = await getPetWindowPlacement();
  if (!placement) {
    return;
  }
  const monitorLeft = placement.monitorX;
  const monitorRight = placement.monitorX + placement.monitorWidth;
  const leftBoundary = monitorLeft + 16;
  const rightBoundary = monitorRight - placement.width - 16;
  const step = direction === 'right' ? DESKTOP_WALK_STEP_PX : -DESKTOP_WALK_STEP_PX;
  const nextX = placement.x + step;
  const boundedX = Math.min(rightBoundary, Math.max(leftBoundary, nextX));
  const nextDirection =
    boundedX === rightBoundary ? 'left' : boundedX === leftBoundary ? 'right' : direction;
  const nextY = getLaneY(placement.monitorY, placement.monitorHeight, placement.height, lane);
  if (nextDirection !== direction) {
    setDirection(nextDirection);
  }
  await setPetWindowPosition(boundedX, nextY);
}

function ensureWorkSessionStarted(): void {
  if (!readNumber(WORK_SESSION_STARTED_AT_KEY)) {
    saveNumber(WORK_SESSION_STARTED_AT_KEY, Date.now());
  }
}

function readNumber(key: string): number | null {
  const value = window.localStorage.getItem(key);
  if (!value) {
    return null;
  }
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function saveNumber(key: string, value: number): void {
  window.localStorage.setItem(key, String(value));
}
