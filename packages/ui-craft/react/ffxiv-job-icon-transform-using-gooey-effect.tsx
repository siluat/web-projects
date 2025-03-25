'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './ffxiv-job-icon-transform-using-gooey-effect.module.css';

const ANIMATION_INTERVAL = 500; // ms

/**
 * Job icons from Final Fantasy XIV Online cycle with a smooth transition effect using the Gooey effect.
 */
export function FfxivJobIconTransformUsingGooeyEffect() {
  const [lastTransitTime, setLastTransitTime] = useState(0);
  const { classNames, transit } = useGooeyEffectClassName(
    Object.keys(ffxivJobIconData.paths).length,
  );

  // Switch to the next icon using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (timestamp - lastTransitTime >= ANIMATION_INTERVAL) {
        transit();
        setLastTransitTime(timestamp);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [transit, lastTransitTime]);

  return (
    <div className={styles.contrastFilter}>
      <div className={styles.iconContainer}>
        {Array.from(Object.entries(ffxivJobIconData.paths)).map(
          ([key, path], index) => (
            <JobIconSvg
              className={`${styles.icon} ${classNames[index]}`}
              key={key}
              path={path}
              aria-label={`${key} job icon`}
            />
          ),
        )}
      </div>
    </div>
  );
}

/**
 * Manage class names for switching between elements using the Gooey effect.
 * This hook requires the animation definitions in the ffxiv-job-icon-transform-using-gooey-effect.css file.
 *
 * @param numberOfElement Number of elements to switch between
 * @returns Object containing transit function and class names array
 * @throws Error if numberOfElement is less than or equal to 1
 */
export function useGooeyEffectClassName(numberOfElement: number): {
  transit: () => void;
  classNames: (
    | typeof styles.showing
    | typeof styles.hiding
    | typeof styles.hidden
  )[];
} {
  if (numberOfElement <= 1) {
    throw new Error(
      'useGooeyEffectClassName: numberOfElement must be greater than 1',
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(-1); // -1 means there's no previous element in initial state

  // transit function switches to the next element
  const transit = useCallback(() => {
    setPreviousIndex(currentIndex);
    setCurrentIndex((current) => (current + 1) % numberOfElement);
  }, [currentIndex, numberOfElement]);

  // Calculate class names for each element
  const classNames = useMemo(() => {
    return Array.from({ length: numberOfElement }, (_, index) => {
      if (index === currentIndex) return styles.showing;
      if (index === previousIndex) return styles.hiding;
      return styles.hidden;
    });
  }, [currentIndex, previousIndex, numberOfElement]);

  return { transit, classNames };
}

function JobIconSvg({
  path,
  ...props
}: React.ComponentProps<'svg'> & { path: string }) {
  return (
    <svg role="graphics-symbol" viewBox={ffxivJobIconData.viewBox} {...props}>
      <g fill="currentColor">
        <path d={path} />
      </g>
    </svg>
  );
}

const ffxivJobIconData = {
  viewBox: '0 0 1024 1024',
  paths: {
    paladin:
      'M757 139q-5 0-14 10-6 6-18.5 21.5T707 192q-9 10-14 10H555q-4 0-20-34l-6-13q-6-12-14-20-5-6-11-8l-4-2-4 2q-6 2-11 8-8 8-14 20l-6 13q-16 34-20 34H307q-5 0-14-10-5-6-17.5-21.5T257 149q-9-10-14-10-14 0-26 13-14 14-14 35v258q0 96 33 177 31 76 88 130 48 45 115 88 34 21 61 35 26-13 61-35 67-43 115-88 57-54 88-130 33-81 33-177V187q0-21-14-35-12-13-26-13zM469 768q-11-6-21-12-26-17-49-37-34-29-59-61-31-40-47-94-12-42-12-80l1-219h187v503zm191-110q-25 32-59 61-23 20-49 37l-21 12V265h187l1 219q0 38-12 80-16 54-47 94z',
    monk: 'M525 235q21-18 36-39 12-17 19-35 6-13 9-26l1-10h-10q-12 1-26 4-20 4-38 13-24 11-45 29L190 407q-20 17-35 38-12 17-20 35-6 13-8 26l-2 10h10q13-1 27-4 19-4 38-13 23-11 44-29l140-118zm142 169q21-17 36-38 12-17 20-36 5-13 8-25l2-10h-10q-13 1-27 4-19 4-38 13-23 11-44 29L333 576q-21 18-36 39-12 17-20 35-5 13-8 26l-2 9h10q13 0 27-3 19-5 38-13 23-11 44-29l141-118zm89 106L616 628 475 746q-21 18-36 39-12 16-19 35-6 13-9 25l-1 10h10q12 0 26-3 20-5 38-14 24-11 45-28l281-236q38-32 55-74 9-21 10-35h-10q-13 0-27 3-19 5-38 13-23 12-44 29z',
    warrior:
      'M875 500l-2-26q-3-31-12-63-11-44-31-82-17-31-45.5-62t-57-49-43-14-22.5 12q-11 11-16 32l-4 22q-4 21-9 32-7 17-25 38-22 25-67 33-23 3-41 2-20 1-43-2-44-8-65-33-18-21-25-38-5-11-9-32l-4-22q-5-21-16-31-8-9-22.5-13t-43 14-57 49-45.5 62q-20 38-31 82-9 32-12 64l-2 25q1 24 7 57 11 63 39 114 16 31 45 62t57 49 42.5 14 23.5-12q10-11 15-32l5-22q4-21 8-32 8-17 25-38 16-18 44-27 20-7 44-8h20q21-2 43 2 44 8 65 33 18 21 25 38 5 11 9 32l4 22q5 21 16 31 8 9 22.5 13t43-14.5 57-49T830 670q20-37 31-81 9-32 12-64zM760 627q-9 18-22 35-9 12-18 22l-8 7-3-11q-5-15-12-29-10-19-23-35-16-19-36-32-24-16-51-25-22-7-44-11-16-2-31-2l-12 1q-18-2-45 2-50 8-92 35-37 23-59 68-12 22-16 40l-7-8q-10-10-19-22-12-17-22-35-13-26-20-58-5-24-6-49l-1-20q-1-19 2-44 6-48 25-83 9-18 22-35 9-12 18-22l8-7 3 11q5 15 12 28 10 20 23 36 16 19 36 32 44 28 95 35 26 4 43 2 19 2 44-2 51-8 94-35 20-13 36-33 13-15 23-35 7-14 12-28l3-12 8 8q9 10 18 22 13 17 22 35 19 35 25 82 3 25 2 45v1q1 22-3 46-6 46-24 80z',
    dragoon:
      'M723 335h-38l-8 10q-9 12-18 19-11 10-17 10-11 0-18-14t-7-28V171q0-13-7-30-4-13-12-25l-7-11-7 12q-7 13-12 26-7 17-7 28v172l-5 7q-7 8-19 16-19 13-41 16-22-3-41-16t-24-23V171q0-11-7-28-5-13-12-26l-7-12-7 11q-8 12-12 25-7 17-7 30v161q0 14-7 28t-18 14q-6 0-17-10-9-7-18-19l-8-10h-38q-6 0-10.5 4t-3.5 10q0 4 72 165 53 117 58 130 7 19 41 122l19 56q5 13 14 23t16 10l17 1 17-1q7 0 16-10t14-23l19-56q34-103 41-122 5-13 58-130 72-161 72-165 0-6-4-10t-10-4zm-92 142q-5 14-24 35-17 20-34 31l-10 6q-12 7-19.5 12.5t-14 14T523 588t13 20q16 20 16 25v54q0 6-17 30-10 13-11 17-5 10-8 23t-3 19.5-7 10.5l-6 2-6-2q-7-4-7-10.5t-3-19.5-8-23q-1-4-11-17-17-24-17-30v-54q0-5 16-25 13-16 13-20t-6.5-12.5-14-14T437 549l-10-6q-17-11-34-31-19-21-24-35l-10-39 6-9q8-11 16-16 17-11 30-11 2 0 14 12 21 23 33.5 28.5T482 451q8 2 14 2h8q6 0 14-2 11-3 23.5-8.5T575 414q12-12 14-12 13 0 30 11 8 5 16 16l6 9z',
    bard: 'M368 653V341q0-5-5-9t-12-6l-6-1-6 1q-7 2-12 6t-5 9v312q0 8 12 13 5 2 11 3l6-1q7-2 12-6t5-9zm122 0V341q0-8-11-13-6-2-12-3l-6 1q-6 2-11.5 6t-5.5 9v312q0 5 5.5 9t11.5 6l6 1 6-1q7-2 12-6t5-9zm123 0V341q0-5-5-9t-12-6l-6-1-6 1q-7 2-12 6t-5 9v312q0 5 5 9t12 6l6 1 6-1q7-2 12-6t5-9zm119-538q-17 0-32.5 13.5T684 151t-8 11q-4 2-16 2H299q-18 0-34.5 7.5T235 192q-8 8-14 21.5t-6 23.5q0 20 5 30 8 13 27 13 14 0 25-7 7-4 17-14 7-7 11-9 6-4 11-4h328q16 0 31 10 18 13 18 35v346q0 14-15 38-16 26-41 49-28 27-61 43-39 18-79 18-115 0-195-60l-2-2q-9-6-18-8.5t-14 3 0 23.5 14 28q12 13 35 30 35 27 75 44 52 22 105.5 22T613 829q65-35 109-86 47-55 47-102V304q0-11 8-28.5t8-28.5v-82q0-15-18-32.5T732 115z',
    whiteMage:
      'M464 365q27 0 46-19t19-46-19-46.5-46-19.5-46.5 19.5T398 300t19.5 46 46.5 19zm58-239q-13-2-23 1t-12 10.5 1.5 15T499 165l8 4q34 15 54 36 37 38 37 97 0 35-16.5 67T537 420q-30 21-65 21-39 0-69-12-18-8-41-25l-5-4q-10-7-18-6-5 1-8 5-7 7-3 24 3 14 10 21 32 39 103 67l3 1q11 4 16 8 10 7 10 17v266q0 26 10 49t19.5 23 20-23 10.5-49V540q0-9 7.5-22.5T555 500q17-9 39-28 33-29 53-66 26-49 26-107 0-44-21-82-20-37-55-61t-75-30z',
    blackMage:
      'M783 146q-17 12-90 64-68 49-84 61-50 38-71 19-11-10-13-29-1-17 4.5-31t25.5-31l5-5q4-4 3.5-16t-6.5-19q-5-4-21-2t-36 11q-22 11-42 26l-11 9q-55 42-89 73-46 43-96 103-27 34-47 62-54 45-76.5 111t-7 134 65 117.5 118 65 134.5-7T559 785q31-22 64-49 58-48 100-94 31-33 72-87l10-12q15-20 26-43 8-20 10.5-36t-1.5-20q-7-6-19-7t-16 4l-5 5q-17 20-31 25.5t-31 3.5q-19-1-29-12-19-21 19-71 12-18 61-84 52-73 64-91 10-16 16-52 4-20 5-39l1-1-18 2q-21 2-38 6-24 6-36 13zM369 797q-50 0-92-28t-61.5-74.5-9.5-96 45.5-85.5 85.5-46 96.5 9.5T508 538t28 93q0 45-22.5 83T453 774.5 369 797zm305-419q-28 42-35 71-9 36 12 59 11 13 40 14 21 1 48-3l23-5q-10 16-24 30l-8 10q-26 34-47 55-27 27-73 65 11-59-7-116.5t-60.5-100-100-60.5-116.5-7q38-47 66-74 21-21 54-47l10-8q14-14 31-25l-5 24q-5 27-4 48 2 29 15 40 23 21 59 12 29-7 70-35 40-26 198-145l-1 1Q699 341 674 378z',
    summoner:
      'M776 347q-2-4-4-11-4-10-9-13-6-4-25.5-5.5T712 343q-3 16-2 51 1 14 0 19-1 15-18 21-10 4-34 5h-1q-9 1-34-12-15-8-53-30-45-27-67-38-27-13-81-54-31-24-91-73-46-37-56-43l-16-12q-19-14-26-16-11-3-19 9 44 103 76 200 26 81 42 157 12 60 18 113 3 39 3 70l-1 23-91 1q-23 0-27.5 7.5T237 768q3 5 30 13 31 9 69 15 49 6 95 4 57-2 105-17 57-17 99-51 83-83 121-167 29-65 30-129 1-36-8-82zM412 710q-4-102-20-194-19-110-50-175l25 23q31 28 56 48 36 28 57 36 9 4 36 13 61 21 89 34 48 22 55 43l-9 14q-26 42-46 65-34 40-75 63-53 28-118 30z',
    scholar:
      'M839 442q-6-9-15-18-36-11-49 17-6 13-7 34-1 18 2 24 13 30 13 48 0 33-24 57t-57.5 24-57.5-24-24-57q0-36 15-64 13-22 38-42 15-13 49-33 24-15 36-23l-4-3q-25-19-43-29-32-16-76-24-55-11-135-11t-135 11q-44 8-76 24-18 10-43 29l-4 3q12 8 36 23 34 20 49 33 25 20 38 42 15 28 15 64 0 34-24 57.5T298.5 628 241 604.5 217 547q0-18 13-48 3-6 2-24-1-21-7-34-13-28-49-17-9 9-15 18-15 22-25 49-11 30-11 56 0 61 38 109t98 61 114.5-14 80.5-82.5 11-115-63-96.5q23-9 49-13 17-3 47-4 30 1 47 4 26 4 49 13-49 37-63.5 96.5t11.5 115 80.5 82.5T739 716.5t98-61T875 547q0-26-11-56-10-27-25-49z',
    ninja:
      'M583 698q8-5 14-11 10-9 18-18 16-19 28-40 35-61 35-129 1-93-61-190-34-53-82-90-41-31-92-51-40-16-85-24-31-5-62-6l-25 1 17 2q20 4 43 12 31 11 60 28 37 22 70 51 39 34 70 78-8-3-17-6l-9-3q-12-3-26-5-18-2-38-2-24 0-47 4-28 5-54 15-29 13-56 32-30 22-55 53-28 34-51 78-46 88-39 187 4 71 35 141 15 35 29 56l-6-16q-7-20-11-43-6-32-6-66 0-43 9-86 10-51 33-100 1 9 3 18 4 20 12 38 4 9 8 17 32 64 91 102 82 54 206 48 62-2 119-26 47-19 90-53 33-27 62-62 21-25 37-51l12-21-11 12q-14 16-31 32-26 21-55 38-37 22-78 35-49 16-104 21zm-137-36q-39 0-71.5-19T323 591.5t-19-71 19-71.5 51.5-52 71-19 71 19 51.5 52 19 71.5-19 71-51.5 51.5-70.5 19z',
    machinist:
      'M756 479q-15-15-32-27-207-147-414-293l-1-1q-19-13-29-16-29-8-46 22-14 23 10 42 10 8 32 23l95 68q154 108 230 163l18 12q16 10 24 16 14 11 23 23-9 8-20 15-37 18-51 35t-10 38 27 54q14 20 31 38 14 14 11 28-3 12-18 24-13 10-18 12t-10-4q-4-4-16-23-23-34-33-53-16-33-45-17-22 13-7 43 24 48 37 71 22 39 45 66 18 22 30 22t30-23q13-17 37-52l11-16q22-32 26-42 6-15-1-29-5-10-30-40l-3-4q-10-12-26-30-20-21-22-28-3-9 10-16 10-6 51-21l5-1q11-5 34-16l3-2q27-14 27-30 1-13-15-31zm-205 59q6-26-.5-44T522 462q-40-27-119-83l-109-76q-11-8-22.5-8.5t-15 10.5 0 26 10.5 23 15 12q7 4 12 7 115 83 176 124l2 1q19 13 26 21 12 15 9 31-2 11-10 22t-17.5 13-18.5-4.5-8-16.5q1-26-10-39-8-11-32-20-8 21-10 46-1 14 1 43l1 10q2 23 14 31 11 6 34 2 34-5 52.5-14.5t29-28.5 18.5-56z',
    darkKnight:
      'M323 527q73-22 101-52 30-33 27-92-36 10-111 43-50 21-75 30-42 16-75 23 20-23 56-48 21-15 66-43 65-40 91-62-46-31-72-53-35-30-57-61 39-2 79 12 24 8 69 33l29 15q10-20 16-47 4-16 8.5-49.5T483 126q6-27 15-47 11 24 18 55 5 19 11 57 9 54 16 78 19-7 54-22 40-17 60-23 35-11 67-13-21 34-56 62-28 24-74 51 26 22 92 64 45 28 66 43 36 26 58 48-38-7-91-27-31-12-94-39t-88-35q-5 54 31.5 94T677 529q-13 18-44 56-37 43-52 66-26 38-33 71l-2 9q-14 63-22 95-14 52-29 95l-13-62q-19-90-30-135-9-38-41-86-19-28-64-82zm175-48q-12 6-23 15-6 6-16 18-9 10-14 15-15 15-4 32 10 14 32 49l19 29q32-36 45-57.5t12.5-36.5-14.5-31q-9-10-37-33z',
    astrologian:
      'M519 328q-115 0-229 1l-12-1q-12 0-17 1-7 2-10.5 10.5T247 367q-2 60 1 171 0 12 8.5 19.5t21 7 21-8T307 537q2-29 3-88v-1q0-28 4.5-40t13.5-15q5-1 21 0h3q48 3 96 2 17-1 25 3 11 4 16 17.5t5 41.5q0 21 1.5 63.5T497 584v50q1 42-1 53-3 15-17 18-9 3-46 2-33-2-55-2h-16q-31 1-39-1-11-3-14-13-1-7-1-33l1-33q0-2-5-6l-6-7q-125 78-160 212 54-55 94-88l7-6q11-12 15-13 8-1 3 22-4 21 20 28 14 4 46 4h9q42 1 127 0h32q33-1 47-5.5t19-18.5 6-45q1-94 3-280v-7q0-17-3-44-4-44-44-43zm166 22q-7-9-8-24-1-9 1-27 1-12 1-18-2-34-6-45-4-14-19-18-11-3-47-3l-144 1h-53q-16 1-24 9t-8 23q1 26 29 28 12 1 35 2l137 3q21 0 31 11t9 33q-1 51 0 154v126q0 12 3 18 5 8 16 9 28 4 36-20 4-15 4-31l1-19q1-39-2-58 4-48 13-72 11-28 39-47 19-12 59-34 48-26 74-44-50-11-99 2-46 12-78 41z',
    samurai:
      'M774 739q-64 73-155 102-87 29-180 11-37-7-65-20-52-23-24-51 7 4 43 9 28 4 62 6 64 4 125-18 64-24 113-72 29-32 35-73 7-46-22-84-17-23-45-33.5t-49-2.5q-15 6-24 20-5 9-7 19v-1q6 41 11 82 6 26-5 34-6 5-24 5H440q-18 0-24-5-11-8-5-34l4-34q3-33-2.5-48T393 531q-8-3-30-4t-34-3q-20-3-37-12-10-5-27-21.5T240 470q-12-5-18 6-8 13-11 52 5 79 48 133 14 11 17 21 2 5 0 14l-1 5q-1 5-4 10-6 7-16 5-14-3-35-24-50-55-69.5-133T148 403q17-81 68-139.5T338 173q69-31 144.5-32T628 170q23 10 38.5 24t11 21-26.5 6-43-9q-71-23-149-6-17 5-36 17-11 7-29 22-14 11-19 15-17 12-41 21-19 8-29 15l4-2q-8 5-15 11-4 4-10 12 6-7-6 6-16 25-10 54 6 26 28 47 36 27 69 32t56-9.5 30-44.5q25-97 50-111h1q28 16 54 130l3 10q2 11 5 15 4 7 13 7 12-3 27-6.5t23-4.5q11-1 32 1 23 2 51 16 22 11 42 26l1 1q10 11 16 11 11 0 14-32v1q-4-50-20-112-8-32-9-42 0-17 11-26 7-2 16.5 6.5T805 323q41 65 51 139.5t-11 147T774 739zM525 577q-11-137-24-150-13 13-24 150-1 10 2.5 16.5T491 600h21q7 0 10.5-6.5T525 577z',
    redMage:
      'M693 554q-5-2-11.5-6.5T669 542q-8-3-23-3-35 0-64 18.5T536.5 607 520 674q0 55 32 88.5t87 42.5q11 1 19.5 12t6.5 27-22 19q-15 1-38-5-68-13-107-60-42-50-42-129 0-49 22-91.5t62-70.5l2-1q25-14 28-51 7-130 21-275l3-27q3-33 5-43 3-16 10-16 6 0 10 15 2 11 5 44l2 27q11 105 19 227 3 33 12 59 8 24 15 30 10 4 29 15 17 10 24 13 12 5 19 4 6 1 4 7t-10.5 12.5-20.5 9-24-2.5zm-362-87q3-3 16 5 8 4 27 18l21 15q13 8 28 13l6 2q13 0 23 6.5t5 12.5q-33 40-42.5 102T435 765q16 32 43 64l1 2q0 8-11.5 5t-25-12-17.5-15q-11-9-23-26-7-6-17-1l-21 14q-19 14-27 18-13 8-16 5-3-4 5-17 4-8 19-28l14-20 4-7q3-6 3.5-15t-.5-15q-3-11-5-23v-1q-3-22-15-25l-8-2-27-5q-30-5-41-9-18-5-19-11 1-6 19-11 11-4 41-9l27-5 10-3q7-2 14.5-8.5T373 591q3-11 9-21 1-3 1-5-2-15-15-33l-14-21q-14-20-19-28-7-13-4-16zm240 204q0-19 11-35t29-23.5 37-4 32.5 17.5 17.5 33-3.5 37-23.5 29-36 11q-27 0-45.5-19T571 671z',
    blueMage:
      'M868 301q-2 0-13.5 2t-20.5 3q-2-33-29.5-63.5T745 206q-20-3-39 7-16 9-24 23.5t0 21.5q2 2 13 4 15 2 22 5 13 6 17 19 8 22 2 36.5T716 342l-97 29q-11 4-30 11-24 9-38 12-23 6-51 6t-51-6q-14-3-37-12-19-7-29-10l-32-10q-96-29-138-41-72-21-81-20-37 4-14 71l1 2q24 75 61 134 51 82 105 89 42 6 79-5 23-6 60-26 24-12 36-17 21-9 40-10 18 1 38 9 12 5 34 16-17 32-50 94-38 73-43 84l-7 15q-7 15-9 22-3 10 2.5 14t16.5-4q6-5 16-16l3-3q19-19 68-78 64-75 84-93 31 2 62-2 54-7 105-89 37-59 61-134l1-2q8-23 9-39 1-29-23-32zM290 521q-32-4-56-33-19-22-31-56-9-28-8-44 1-11 58 6 48 15 108 41.5t69 36-12.5 23T362 516q-39 9-72 5zm420 0q-33 4-72-5-34-8-55.5-21.5t-12.5-23 69-36T747 394q57-17 58-6 1 16-8 44-12 34-31 56-24 29-56 33z',
    gunbreaker:
      'M820 222q-34 48-68 95l-2 5q-4 7-13 18-12 14-32 34L366 710q46 29 99.5 33t103-17.5 83.5-63 45-94.5q4-23 18-33 11-8 24.5-7t23.5 11q13 12 10 31-14 90-67 150 0 5 4 19 7 24 7 36 1 20-10 29-10 8-25 2-9-3-28-14-12-7-16-9-8-4-11-2-77 43-164.5 37.5T305 760l-1 1q-68 49-93 65-13 9-21 11-7 1-10 0l-6-6q-2-4 0-10 2-9 10-21 20-28 68-95l3-5q4-7 12-18 13-15 33-35l306-303q-50-34-111-38t-115 24.5-85.5 81T263 525q0 17-7 30-8 14-25.5 15.5t-30.5-12-13-33.5q0-66 27-124t76-100 111-60q3-1 6-8 2-5 6-18 7-24 12-34 8-18 20-19t26 16q7 10 20 33 11 20 14 20 87 6 156 59 29-26 37-27l96-68q13-8 21-10 6-2 10 0l6 6q2 4 0 10-2 9-11 21z',
    dancer:
      'M801 424q-2 36-13 62.5T754 542q-15 19-58 65l-19 19q-54 59-91 108-21 29-32 49-7 13-17.5 39T520 858q-10 14-22 14t-22-14q-5-10-16-36t-18-39q-34-61-123-157l-19-19q-43-46-58-65-23-29-34-55.5T195 424q-4-53 22-90 23-34 60-43 50-12 96-43 74-50 125-143 51 93 125 143 46 31 96 43 37 9 60 43 26 37 22 90zm-65-15q-3-31-20-49-15-15-37.5-18t-44.5 5q-30 9-37 43-4 20 0 61 2 22 2 29-1 12-7 13-15 3-32-16-16-16-28-41.5T516 392q-1-6 1-17 2-15 8-28 6-16 28-33 19-14 28-15-10-3-47-41l-36-38h-1q-67 74-82 79 9 1 28 15 22 17 28 33 6 13 8 28 2 11 1 17-3 18-15.5 43.5T437 477q-18 19-33 16-6-1-7-13 0-7 2-29 4-41 0-61-7-34-37-43-22-8-44.5-5T280 360q-17 18-20 49-4 38 21 79 15 24 55 68l16 17q33 37 87 85 28 26 38 37 16 17 21 32 5-15 21-32 10-11 38-37 54-48 87-85l16-17q40-43 55-68 25-41 21-79z',
    reaper:
      'M846 560q-2-4-11 0-6 2-21 12-76 48-180 79-107 31-182 25-58-4-98-19l47-150q22 54 72 83 40 23 85 22.5t84-22.5 62-62q22-37 23-79t-17-79.5-52-62.5q-1-1-1-17 0-18-2-26-2-15-9-18t-20 5q-7 5-20 18-10 9-11 9-34-8-67.5-1.5T465 301l36-116q6-16 9-39 4-33-6-36.5T477 135q-11 20-16 36L299 622q-17-17-24-39t-5-51q1-18 7-51l1-5q5-26-.5-28.5t-20 20T232 516q-15 33-19 61-5 41 7 77 13 41 48 67l-18 78q-5 15-7 33-2 27 8.5 30.5T276 843q10-15 15-30l30-66q17 5 32 8 63 10 139-2 83-12 164-50 89-41 164-108 16-14 21-21 8-10 5-14zM466 390q15-24 39-38t52.5-14.5 53 14 38.5 39 14 52.5-14 53-38.5 38.5-52.5 14-53-14-39-39-14-52.5 14-53z',
    sage: 'M872 223q-18 33-56 96-49 82-63 112-4 10-4 28 1 11 0 18-2 31-10.5 47.5T721 531l-10-11q-26-31-40-42-24-17-56-23-21-3-20-13.5t17.5-23T651 397q4-2 10-4 13-3 25-10 15-12 36-36 12-15 39-49 52-66 80-93 16-11 25.5-6t5.5 24zM563 373q-18 0-31.5-9.5t-13.5-23 13.5-23 32-9.5 32 9.5 13.5 23-13.5 23T563 373zm-135 87q-26 0-45-13.5T364 414t19-32.5 45.5-13.5 45.5 13.5 19 32.5-19 32.5-46 13.5zm41-192q-64 31-116 79-58 53-84 110-29 65-13 126 6 20 17 38 7 11 21 27 16 19 21 30 7 17 2 41-14 36-42 35-70 0-105-111-25-79 5-159 28-78 100-140t171-91q12-2 21.5-.5t10 6-8.5 9.5zM364 584q-25 0-42-12.5T305 542t17-29.5 41.5-12.5 42 12.5T423 542t-17.5 29.5T364 584zm58 111q6-17 15-47 13-43 21-62 14-31 36-54 25-28 69-53 27-6 58 6 28 11 50.5 34t31.5 48q-7 85-64 142-53 52-132.5 68T348 768q1-12 11-22 6-5 22.5-14t24.5-14q12-10 16-23zm60 22q18 5 49-1 28-8 55-27 30-22 45-49 17-32 7-63-5-12-17.5-23T592 539q-19-4-29 5-83 71-81 173z',
    viper:
      'M680 161q2 42-2 63.5T659 268q-13 18-22.5 25t-22.5 9q-8 1-30 1h-12q-17 53-22 87-4 31 2 56 3 16 15 48 18 44 26 79 27 69-3 274 27-22 45-57 16-30 27-74 7-26 18-80 9-46 14-67 9-36 19-61 8-14 33 10 29-111 12-195-16-80-78-162zm15 140q13 49 15 74 2 35-8 69-25 0-38 17-11 15-15 44-3 17-3 57l-1 23-3 8q-4 12-6 15-3 5-3-5 2-44-4-78-4-20-14.5-49T602 430q-2-28 8-67 11 0 29-8t32-21q18-15 24-33zM316 161q-2 42 2.5 63.5T337 268q13 18 23 25t22 9q9 1 31 1h12q17 53 21 87 4 31-1 56-3 16-16 48-17 44-26 79-27 69 4 274-27-22-46-57-15-30-27-74-7-26-18-80-8-46-14-67-8-36-19-61-8-14-33 10-28-111-12-195 16-80 78-162zm-15 140q-12 49-14 74-3 35 7 69 26 0 39 17 11 15 14 44 3 17 4 57v23l3 8q5 12 6 15 3 5 3-5-2-44 5-78 3-20 13.5-49t12.5-46q3-28-7-67-12 0-29.5-8T325 334q-17-15-24-33z',
    pictomancer:
      'M872 223q-18 33-56 96-49 82-63 112-4 10-4 28 1 11 0 18-2 31-10.5 47.5T721 531l-10-11q-26-31-40-42-24-17-56-23-21-3-20-13.5t17.5-23T651 397q4-2 10-4 13-3 25-10 15-12 36-36 12-15 39-49 52-66 80-93 16-11 25.5-6t5.5 24zM563 373q-18 0-31.5-9.5t-13.5-23 13.5-23 32-9.5 32 9.5 13.5 23-13.5 23T563 373zm-135 87q-26 0-45-13.5T364 414t19-32.5 45.5-13.5 45.5 13.5 19 32.5-19 32.5-46 13.5zm41-192q-64 31-116 79-58 53-84 110-29 65-13 126 6 20 17 38 7 11 21 27 16 19 21 30 7 17 2 41-14 36-42 35-70 0-105-111-25-79 5-159 28-78 100-140t171-91q12-2 21.5-.5t10 6-8.5 9.5zM364 584q-25 0-42-12.5T305 542t17-29.5 41.5-12.5 42 12.5T423 542t-17.5 29.5T364 584zm58 111q6-17 15-47 13-43 21-62 14-31 36-54 25-28 69-53 27-6 58 6 28 11 50.5 34t31.5 48q-7 85-64 142-53 52-132.5 68T348 768q1-12 11-22 6-5 22.5-14t24.5-14q12-10 16-23zm60 22q18 5 49-1 28-8 55-27 30-22 45-49 17-32 7-63-5-12-17.5-23T592 539q-19-4-29 5-83 71-81 173z',
  },
};
