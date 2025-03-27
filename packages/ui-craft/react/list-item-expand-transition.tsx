'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useClickAway, useKey } from 'react-use';
import styles from './list-item-expand-transition.module.css';

export function ListItemExpandTransition() {
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  useKey('Escape', () => setActiveItem(null));

  return (
    <div className={styles.listWrapper}>
      {ITEMS.map((item) => (
        <Item key={item.id} item={item} setActiveItem={setActiveItem} />
      ))}
      <AnimatePresence>
        {activeItem ? (
          <ActiveItem activeItem={activeItem} setActiveItem={setActiveItem} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Item({
  item,
  setActiveItem,
}: { item: Item; setActiveItem: (item: Item) => void }) {
  return (
    <motion.div
      layoutId={`item-${item.id}`}
      whileTap={{ scale: 0.98 }}
      onClick={() => setActiveItem(item)}
      className={styles.item}
      tabIndex={0}
      aria-label={`${item.name} 상세정보 보기`}
      onKeyDown={(e) => e.key === 'Enter' && setActiveItem(item)}
    >
      <motion.div
        layoutId={`item-header-${item.id}`}
        className={styles.itemHeader}
      >
        <motion.img
          src={item.icon}
          width={40}
          height={40}
          layoutId={`item-icon-${item.id}`}
          className={styles.icon}
        />
        <div className={styles.headerDescription}>
          <motion.span
            layoutId={`item-name-${item.id}`}
            className={styles.itemName}
          >
            {item.name}
          </motion.span>
          <motion.span className={styles.itemHeaderLevelWrapper}>
            <span className={styles.itemHeaderLevelLabel}>
              착용 레벨{' '}
              <span className={styles.itemHeaderLevel}>{item.itemLevel}</span>
            </span>
            <span className={styles.itemHeaderLevelLabel}>
              아이템 레벨{' '}
              <span className={styles.itemHeaderLevel}>{item.itemLevel}</span>
            </span>
          </motion.span>
        </div>
        <motion.button
          aria-hidden
          tabIndex={-1}
          layoutId={`close-button-${item.id}`}
          className={styles.closeButton}
          style={{ opacity: 0 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            height="20"
            width="20"
            stroke="currentColor"
          >
            <title>Close button</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      </motion.div>
      <motion.div
        layoutId={`item-detail-${item.id}`}
        className={styles.itemDetail}
        style={{ position: 'absolute', top: '100%', opacity: 0 }}
      >
        <motion.div className={styles.itemDetailLevel}>
          <span>아이템 레벨 {item.itemLevel}</span>
        </motion.div>
        <motion.div className={styles.baseParameterWrapper}>
          <h2 className={styles.baseParameterHeader}>추가 능력치</h2>
          <ul className={styles.baseParameterList}>
            {item.baseParam.map((param) => (
              <li key={param.name}>
                <span className={styles.baseParameterLabel}>{param.name}</span>+
                {param.value}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ActiveItem({
  activeItem,
  setActiveItem,
}: {
  activeItem: Item;
  setActiveItem: (item: Item | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => setActiveItem(null));

  return (
    <motion.div
      ref={ref}
      layoutId={`item-${activeItem.id}`}
      className={`${styles.item} ${styles.activeItem}`}
    >
      <motion.div
        layoutId={`item-header-${activeItem.id}`}
        className={styles.itemHeader}
      >
        <motion.img
          src={activeItem.icon}
          width={40}
          height={40}
          layoutId={`item-icon-${activeItem.id}`}
          className={styles.icon}
        />
        <div className={styles.headerDescription}>
          <motion.span
            layoutId={`item-name-${activeItem.id}`}
            className={styles.itemName}
          >
            {activeItem.name}
          </motion.span>
        </div>
        <motion.button
          layoutId={`close-button-${activeItem.id}`}
          className={styles.closeButton}
          aria-label="Close button"
          onClick={() => setActiveItem(null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            height="20"
            width="20"
            stroke="currentColor"
          >
            <title>Close button</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      </motion.div>
      <motion.div layoutId={`item-detail-${activeItem.id}`}>
        <motion.div className={styles.itemDetailLevel}>
          <span>아이템 레벨 {activeItem.itemLevel}</span>
        </motion.div>
        <motion.div className={styles.baseParameterWrapper}>
          <h2 className={styles.baseParameterHeader}>추가 능력치</h2>
          <ul className={styles.baseParameterList}>
            {activeItem.baseParam.map((param) => (
              <li key={param.name}>
                <span className={styles.baseParameterLabel}>{param.name}</span>+
                {param.value}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

type Item = {
  id: number;
  name: string;
  icon: string;
  isUnique: boolean;
  isUntradable: boolean;
  itemLevel: number;
  itemCategoryName: string;
  physDamage: number;
  delay: number;
  baseParam: {
    name: string;
    value: number;
  }[];
};

const ITEMS: Item[] = [
  {
    id: 10054,
    name: '엑스칼리버: 제타',
    icon: 'data:image/png;base64,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',
    isUnique: true,
    isUntradable: true,
    itemLevel: 135,
    itemCategoryName: '한손검',
    physDamage: 58,
    delay: 2320,
    baseParam: [
      {
        name: '힘',
        value: 41,
      },
      {
        name: '활력',
        value: 48,
      },
    ],
  },
  {
    id: 10063,
    name: '이지스: 제타',
    icon: 'data:image/png;base64,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',
    isUnique: true,
    isUntradable: true,
    itemLevel: 135,
    itemCategoryName: '방패',
    physDamage: 0,
    delay: 0,
    baseParam: [
      {
        name: '힘',
        value: 16,
      },
      {
        name: '활력',
        value: 19,
      },
    ],
  },
  {
    id: 10057,
    name: '롱기누스: 제타',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAbpSURBVFhHpdjva1NXHMfx/hE+6AMnZmyu8UdmJMmSGWvTpmpiR/GuJduFrJ2XQOalEri0qwSKnUEQS0chKI5ChyjCsA/2wIf7286+n++935PvSdKsusKbE9PGvjz33nPPdUq+wtm+6X33wXSHihaPJ1ebXHeorfob07v3YdCqW7/5j3nS+NskrPgLMATk2uy+k0Ba5aO4m2/c5t3aQ23MHzm1F/ocoKi7/G4EKDFOZg6jdzUy1a/bDtDCkhqlQ1s91+ca1+nPSc2h1q4fOPnlHifQqP6KAxRh9pCdSY1D6fPzHKCofrlnGrmDQQo2Lm+knk0DpXBxjxNodO+tBfIsRotvTaPQM+WvApOanjcXPsuZ1Jk0j9mrdVOa8U0l0za1/Ba3fO25Uz235+SN9DTpMdcsbDrdL2+ZB3O7XETQrbuvzK73zuz9+IEbC9RIoDTQLx7aTgdEA2Ajv+0A/WLoIAUoyBGgwCTgPDoUggTKQRb2bQAu5fc5FzcAermugwRQI3G4NdICBalnD+EQAwgcXpdmQlO90rXAldKBDchR4DCyywlSgIIcBdLa1Lr5mj7wki6IPXMp5Znp6SyH16nzWbOcq3J4nT5f51bnQq5RfmXzin2zXCQoddIhX8nt2PxcRMjIrJcGBTQZD6t982iJ1ktadhwgmr0YOUgNREBpZHPuiBPkSvmFg5wEbOQwixoXAxGA6FRAaedOw+z+vGeRAgzoNBEogBo5fMg1EA3PogBlFkeAWLsEKYdYOm6G5vi3Y2cWMWsASn6FzkuFHD0ne3b2BIg0EDgL7NY+0C3oL1pEjxi3nKf1japmunxBpM+WuOWcb4JKaKJffON/v2TSM1lTuTFrKrmA8+/QwkvdX6CL50acl1zlcj7Gh3zX5iugT7PoFyMT3nzORbcOaS9wfDJQkAKUgAISAYm7jkYCqJFydQ+QuKuMAeZjZFDsnh6IyjM1F5nMHIAY5db4MUAXmeA+FuiX6RdQOLQIUMZi1pIY2nzrzGBYi4GCPBVQDvFJwM7Ce9O68YYXXr/QjytRZWpuUL3YM9kLNZM6m+Wxkr1v/B9Ds3Rn3cwWV3kM6UKRVotP+R+5UjggTHyR1LM7Tl6eFuvCNgfcJwGDxUMOr4ECTgIMZWfqPI4DNkp0VSfIccBh5CcDkVfuOkDAEGYSI1AaCNwkYJ0O7/8GaiSAOgEiHGJewAkmCc4C6T48DNTIUSBtWDu33sc4RBdKk4BonZABLbjBHBbjGLhefcEFNfoe5RUfm8rllskSDNXpF2Q+XzblKy1+7eXp3FP5uSccNgwxLuS83Aa93yFDl24cz8j0koBvB0A8XwhQkBaokBrHYVYVErjUdIkD8iSgIAFDFvkxQBTQDkUjm5TMImOTmRWkBqJKBodvPDBGxkDp1EBBMlAhcVUCKWkgwqxpZJYfGQZIjQvonAywBtKh1UBBxkDaLEQLb0xIiyogzdy+WaeHIxkDIBEOt1w4Kk9H38diXL7YMZnUCgO/Sftmng6fjAKQ7pdwcdC5JyXvdxZoBmtjgEBJQAY0kxZJNQkhMZBGG31f7hgWeaZkLp+rMRAtXX0wApQ0sHWDZvAkIKMo/dq+RwgdULrBLS1GAgekAGfpkGskYCEtV4iRyfsTZ3AYNS7gMOL+rdNABJRG4krXSA1EmDk0ANJiGN16TYvjSwLumTXaArXoJm7L0gdUa9f2bbiQ5B4rLdPnkWwKsNaV002TOXebkFm6iGp0EWEJqtE66Ts4rkIP8kmbtPGYCAzpF0wComYOT2sucIV2ywNkfKewyOk042T08w/GAjuL/ZOBggSwfe0pw2TUUH6fHiWBFKjMIJBIgBZJsyc4vC7RLbKWoV26QBUuWQdPBiLAdBopQI0U2DggI5PZkwBzkOrwMvBR/cighwt0cdADS4sephEWUBTS7UgX0Ky64b2uaed3eGxi+0Sfkxr5NufRhhZjNbNqCl/epN15mscUjV62avuhvEkPTAdcD5uFYWC7tG2RqJ3fdoDtPP1MkgCBs9GOBEgJqGZhg2NoMXSQGofmc75FMrB373gEOIzU0I1CzxZDB7iNAp0SBHSQCQ4F9NQGoCABxAyWLhQ4vAYQnQjEiSpIDcVfjhGwiLb+AyihEhyKaG1DFnoKoATkWCD69e6ftAvuExDIQUDrwjKdxBOLP9epHPDYos2n3B14YS4/47yrG2b+C4+Q9FRIVS+tm7VvsTQF5qfZLhfRdm4KMAGiiGZSF1Z+d+pU+kO9HOrACUCdAAUJFHCSAIHDyP9PLbOIunS4ddHtP5w2bx86YZnSbd4+ssl7Hdq+SxHdvnQA6jSQcfIlMzkCpbVoci7wvxoGdrHeqZyZm5qa+hcpBO1nx6uKngAAAABJRU5ErkJggg==',
    isUnique: true,
    isUntradable: true,
    itemLevel: 135,
    itemCategoryName: '양손창',
    physDamage: 58,
    delay: 2960,
    baseParam: [
      {
        name: '힘',
        value: 57,
      },
      {
        name: '활력',
        value: 67,
      },
    ],
  },
];
