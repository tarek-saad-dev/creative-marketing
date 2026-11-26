"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpLeft, ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useMarketingMotionPaused } from "@/components/layout/aurora-marketing-main";
import { Artwork, getItems, type ShowcaseItem } from "./immersive-showcase";
import type { WorkWallProject } from "@/server/services/project.service";
import styles from "./scroll-motion-showcase.module.css";

function StripGroup({ items, duplicate = false }: { items: ShowcaseItem[]; duplicate?: boolean }) {
  return (
    <div className={styles.stripGroup} aria-hidden={duplicate || undefined}>
      {items.map(item => (
        <div key={item.id} className={styles.stripCard}>
          <div className={styles.stripArtwork}><Artwork item={item} /></div>
          <span>{item.title}</span>
        </div>
      ))}
    </div>
  );
}

export function MovingPortfolioStrip({ projects }: { projects: WorkWallProject[] }) {
  const items = getItems(projects).slice(0, 8);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "0px", amount: "some" });
  const globallyPaused = useMarketingMotionPaused();
  const [playing, setPlaying] = useState(true);
  const moving = playing && !globallyPaused && inView && items.length > 2;
  if (items.length < 3) return null;

  return (
    <section ref={ref} className={styles.stripSection} aria-labelledby="motion-strip-heading">
      <div className={styles.stripHeader}>
        <div>
          <p className={styles.kicker}>THE CREATIVE STREAM</p>
          <h2 id="motion-strip-heading">إبداع في كل اتجاه.</h2>
        </div>
        <div className={styles.stripActions}>
          <Link href="#work" className={styles.textLink}>كل الأعمال <ArrowDown size={16} aria-hidden="true" /></Link>
          {!globallyPaused && (
            <button type="button" className={styles.iconButton} aria-label={playing ? "إيقاف حركة معرض الأعمال" : "تشغيل حركة معرض الأعمال"} onClick={() => setPlaying(value => !value)}>
              {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
      <div className={styles.stripViewport} data-moving={moving} dir="ltr" tabIndex={0} aria-label="معرض أفقي، يمكن تمريره يدويًا عند إيقاف الحركة">
        <div className={styles.stripTrack}>
          <StripGroup items={items} />
          {playing && !globallyPaused && <StripGroup items={items} duplicate />}
        </div>
      </div>
      {!projects.length && <p className={styles.conceptNote}>نماذج تصميم توضيحية، وليست أعمال عملاء.</p>}
    </section>
  );
}

export function DeviceShowcase({ projects }: { projects: WorkWallProject[] }) {
  const items = getItems(projects).slice(0, 8);
  const [selected, setSelected] = useState(0);
  const activeIndex = selected % items.length;
  const active = items[activeIndex];
  const previous = items[(activeIndex + items.length - 1) % items.length];
  const next = items[(activeIndex + 1) % items.length];
  const ref = useRef<HTMLElement>(null);
  const paused = useMarketingMotionPaused();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 0.5, 1], [36, 0, -36]);
  const leftY = useTransform(scrollYProgress, [0, 0.5, 1], [-28, 0, 28]);
  const rightY = useTransform(scrollYProgress, [0, 0.5, 1], [54, 0, -54]);
  const phoneRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-7, 0, 7]);

  function move(delta: number) {
    setSelected(value => (value + delta + items.length) % items.length);
  }

  return (
    <section ref={ref} className={styles.deviceSection} aria-labelledby="device-showcase-heading">
      <div className={styles.deviceInner}>
        <div className={styles.deviceCopy}>
          <p className={styles.kicker}>DESIGN IN CONTEXT / 03</p>
          <h2 id="device-showcase-heading">شوف التصميم.<br /><span>وهو عايش.</span></h2>
          <p className={styles.description}>كل فكرة ليها شكل وطريقة عرض مختلفة. اكتشف التصميمات داخل تجربة بصرية أقرب لشاشات جمهورك.</p>
          <div aria-live="polite" className={styles.activeInfo}>
            <span>{active.label}</span>
            <h3>{active.title}</h3>
            {active.project ? (
              <Link href={"/work/" + active.project.slug} className={styles.textLink}>استكشف المشروع <ArrowUpLeft size={18} aria-hidden="true" /></Link>
            ) : <p className={styles.conceptNote}>نموذج تصميم توضيحي – ليس مشروع عميل.</p>}
          </div>
          {items.length > 1 && (
            <div className={styles.deviceControls} dir="ltr">
              <button className={styles.iconButton} type="button" aria-label="التصميم السابق" onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
              <span className={styles.counter}>{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
              <button className={styles.iconButton} type="button" aria-label="التصميم التالي" onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
            </div>
          )}
        </div>

        <div className={styles.deviceStage} dir="ltr">
          <div className={styles.orb} aria-hidden="true" />
          <div className={styles.stageLabel} aria-hidden="true">CM / VISUAL STUDIO</div>
          {items.length > 2 && (
            <motion.div className={styles.leftFloat} style={paused ? { y: 0 } : { y: leftY }} aria-hidden="true">
              <div className={styles.leftTilt}><Artwork item={previous} /></div>
            </motion.div>
          )}
          {items.length > 1 && (
            <motion.div className={styles.rightFloat} style={paused ? { y: 0 } : { y: rightY }} aria-hidden="true">
              <div className={styles.rightTilt}><Artwork item={next} /></div>
            </motion.div>
          )}
          <motion.div className={styles.phoneMotion} style={paused ? { y: 0, rotate: 0 } : { y: phoneY, rotate: phoneRotate }}>
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>
                <div className={styles.phoneTop} aria-hidden="true"><span>CM STUDIO</span><span>● ● ●</span></div>
                <div className={styles.phoneArtwork} key={active.id}>
                  <Artwork item={active} />
                </div>
                <div className={styles.phoneBottom}>
                  <span>{active.label}</span>
                  <strong dir="auto">{active.title}</strong>
                  <span className={styles.phoneLine} aria-hidden="true" />
                </div>
              </div>
            </div>
          </motion.div>
          <div className={styles.stageNumber} aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")}</div>
        </div>
      </div>
      {items.length > 1 && (
        <div className={styles.selector} aria-label="اختيار التصميم المعروض">
          {items.map((item, index) => (
            <button type="button" key={item.id} className={styles.thumbnail} aria-pressed={index === activeIndex} aria-label={"عرض " + item.title} onClick={() => setSelected(index)}>
              <Artwork item={item} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
