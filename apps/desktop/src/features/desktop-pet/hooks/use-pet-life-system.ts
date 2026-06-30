import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PetState } from '@momo/shared';
import type { PetLifeBehavior, PetLifeDirection, PetVisualAction } from '../types';
import {
  getPetWindowPlacement,
  isDesktopRuntime,
  setPetWindowPosition,
} from '../runtime/desktop-runtime-api';

const WORK_SESSION_STARTED_AT_KEY = 'momo.workSessionStartedAt';
const LAST_REST_REMINDER_AT_KEY = 'momo.lastRestReminderAt';
const WORK_REMINDER_AFTER_MS = 50 * 60 * 1000;
const NIGHT_REMINDER_AFTER_MS = 30 * 60 * 1000;
const REST_REMINDER_COOLDOWN_MS = 45 * 60 * 1000;
const BEHAVIOR_INTERVAL_MS = 12000;
const MOVEMENT_INTERVAL_MS = 1400;
const DESKTOP_WALK_STEP_PX = 20;
const PREVIEW_WALK_STEP_PX = 18;
const PREVIEW_WALK_BOUNDARY_PX = 46;
const TOP_LANE_MARGIN_PX = 36;
const BOTTOM_LANE_MARGIN_PX = 72;

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
      const reminder = getDueReminderMessage(Date.now());
      if (reminder) {
        setBehavior('remind');
        setReminderMessage(reminder);
        saveNumber(LAST_REST_REMINDER_AT_KEY, Date.now());
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

function chooseNextBehavior(state: PetState | null): PetLifeBehavior {
  if (state && state.energy <= 24) {
    return weightedPick([
      ['sleep', 58],
      ['rest', 24],
      ['idle', 18],
    ]);
  }
  if (state && state.mood >= 72) {
    return weightedPick([
      ['walk', 34],
      ['play', 30],
      ['idle', 24],
      ['rest', 12],
    ]);
  }
  return weightedPick([
    ['idle', 38],
    ['walk', 32],
    ['rest', 18],
    ['play', 12],
  ]);
}

function weightedPick(items: readonly (readonly [PetLifeBehavior, number])[]): PetLifeBehavior {
  const totalWeight = items.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = Math.random() * totalWeight;
  for (const [behavior, weight] of items) {
    cursor -= weight;
    if (cursor <= 0) {
      return behavior;
    }
  }
  return 'idle';
}

function getVisualActionForBehavior(behavior: PetLifeBehavior): PetVisualAction | null {
  if (behavior === 'play' || behavior === 'remind') {
    return 'happy';
  }
  if (behavior === 'sleep') {
    return 'sleep';
  }
  if (behavior === 'rest') {
    return 'lying';
  }
  return null;
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

function getLaneY(
  monitorY: number,
  monitorHeight: number,
  windowHeight: number,
  lane: 'top' | 'bottom',
): number {
  if (lane === 'top') {
    return monitorY + TOP_LANE_MARGIN_PX;
  }
  return monitorY + monitorHeight - windowHeight - BOTTOM_LANE_MARGIN_PX;
}

function ensureWorkSessionStarted(): void {
  if (!readNumber(WORK_SESSION_STARTED_AT_KEY)) {
    saveNumber(WORK_SESSION_STARTED_AT_KEY, Date.now());
  }
}

function getDueReminderMessage(now: number): string | null {
  const startedAt = readNumber(WORK_SESSION_STARTED_AT_KEY) ?? now;
  const lastReminderAt = readNumber(LAST_REST_REMINDER_AT_KEY) ?? 0;
  if (now - lastReminderAt < REST_REMINDER_COOLDOWN_MS) {
    return null;
  }
  const workDurationMs = now - startedAt;
  if (isNightWork(now) && workDurationMs >= NIGHT_REMINDER_AFTER_MS) {
    return '夜深啦，陪你再做一小段就休息吧。';
  }
  if (workDurationMs >= WORK_REMINDER_AFTER_MS) {
    return '已经专注很久啦，起来喝口水伸个懒腰吧。';
  }
  return null;
}

function isNightWork(now: number): boolean {
  const hour = new Date(now).getHours();
  return hour >= 23 || hour < 6;
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
