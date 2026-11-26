"use client";

import { useEffect, useRef, useState } from "react";
import { ResilientImage, ResilientVideo } from "@/components/ui/resilient-media";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpLeft, Pause, Play, Film } from "lucide-react";
import { useMarketingMotionPaused } from "@/components/motion/marketing-motion-context";
import { usePrefersReducedMotion } from "@/components/motion/reduced-motion";
import { videoPoster, isUsableMediaUrl } from "@/lib/media/public-media";
import { BrandButton } from "@/components/ui/brand-button";
import { splitTitleWithHighlight, type HeroCopy } from "@/components/sections/hero/hero-copy";
import type { WorkWallProject } from "@/server/services/project.service";
import styles from "./immersive-showcase.module.css";

type Concept = { id: string; title: string; label: string; word: string; sub: string; theme: string };

// Original typography-only design studies, never represented as commissioned client work.
const concepts: Concept[] = [
  { id: "concept-cut", title: "حملة لصالون رجالي", label: "Social campaign", word: "FRESH\nCUT.", sub: "YOUR STYLE. YOUR RULES.", theme: "cut" },
  { id: "concept-book", title: "تصميم كتاب تعليمي", label: "Book design", word: "STUDY\nSMART.", sub: "LEARN • PRACTICE • REPEAT", theme: "book" },
  { id: "concept-brand", title: "هوية بصرية عصرية", label: "Brand identity", word: "MAKE\nIT BOLD.", sub: "A DISTINCT POINT OF VIEW", theme: "brand" },
  { id: "concept-digital", title: "تصميم حملة رقمية", label: "Digital campaign", word: "GO\nFURTHER.", sub: "IDEAS IN MOTION", theme: "digital" },
];

export type ShowcaseItem = { id: string; title: string; label: string; project?: WorkWallProject; concept?: Concept };

export function getItems(projects: WorkWallProject[]): ShowcaseItem[] {
  return projects.length
    ? projects.map(project => ({
        id: project.id,
        title: project.title,
        label: project.industry || project.services[0]?.nameAr || "Creative work",
        project,
      }))
    : concepts.map(concept => ({ id: concept.id, title: concept.title, label: concept.label, concept }));
}

export function Artwork({ item, priority = false }: { item: ShowcaseItem; priority?: boolean }) {
  if (item.project) {
    const project = item.project;
    return (
      <div className={styles.artwork}>
        <ResilientImage src={project.coverImageUrl} alt={project.coverImageAlt} sizes="(max-width:640px) 80vw, 480px" priority={priority} className={styles.image} />
        {project.primaryMediaType === "VIDEO" && <span className={styles.film}><Film size={16} aria-hidden="true" /> VIDEO</span>}
      </div>
    );
  }

  const concept = item.concept!;
  return (
    <div className={styles.concept} data-theme={concept.theme} role="img" aria-label={concept.title + " – نموذج تصميم توضيحي"} dir="ltr">
      <span className={styles.conceptTop}>CM / CREATIVE STUDY</span>
      <span className={styles.conceptShape} aria-hidden="true" />
      <span className={styles.conceptWord}>{concept.word}</span>
      <span className={styles.conceptSub}>{concept.sub}</span>
      <span className={styles.conceptBadge}>CONCEPT / نموذج توضيحي</span>
    </div>
  );
}

function Coverflow({ items }: { items: ShowcaseItem[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const reduced = usePrefersReducedMotion();
  const paused = useMarketingMotionPaused();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const length = items.length;
  const activeIndex = index % length;
  const active = items[activeIndex];

  useEffect(() => {
    if (!playing || hovered || reduced || paused || length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [playing, hovered, reduced, paused, length]);

  function move(delta: number) {
    setPlaying(false);
    setIndex(current => (current + delta + length) % length);
  }

  const visible = [
    ...(length > 2 ? [{ item: items[(activeIndex + length - 1) % length], position: "left", delta: -1 }] : []),
    { item: active, position: "center", delta: 0 },
    ...(length > 1 ? [{ item: items[(activeIndex + 1) % length], position: "right", delta: 1 }] : []),
  ];

  return (
    <div
      className={styles.coverflow}
      role="region"
      aria-roledescription="معرض دوّار"
      aria-label="معرض التصاميم ثلاثي الأبعاد"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setPlaying(false)}
      onKeyDown={event => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div
        className={styles.stage}
        onTouchStart={event => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={event => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
        }}
        onTouchCancel={() => { touchStart.current = null; }}
      >
        <div className={styles.stageOrbit} aria-hidden="true" />
        {visible.map(({ item, position, delta }) => (
          <div key={item.id} className={styles.stageCard} data-position={position}>
            {delta === 0 ? (
              <Artwork item={item} priority={activeIndex === 0} />
            ) : (
              <button type="button" className={styles.sideButton} onClick={() => move(delta)} aria-label={"عرض " + item.title}>
                <Artwork item={item} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className={styles.stageCaption}>
        <div aria-live={playing && !hovered && !reduced && !paused ? "off" : "polite"} className={styles.captionText}>
          <span className={styles.eyebrow}>{active.label}</span>
          <h2>{active.title}</h2>
          {active.project ? (
            <Link className={styles.detailLink} href={"/work/" + active.project.slug}>شوف تفاصيل المشروع <ArrowUpLeft size={17} aria-hidden="true" /></Link>
          ) : <span className={styles.smallText}>نموذج إبداعي توضيحي – ليس مشروع عميل</span>}
        </div>
        {length > 1 && (
          <div className={styles.controls} dir="ltr">
            <button type="button" onClick={() => move(-1)} aria-label="السابق"><ArrowLeft size={21} /></button>
            <span className={styles.counter} aria-label={"التصميم " + (activeIndex + 1) + " من " + length}>{String(activeIndex + 1).padStart(2, "0")} / {String(length).padStart(2, "0")}</span>
            <button type="button" onClick={() => move(1)} aria-label="التالي"><ArrowRight size={21} /></button>
            {!reduced && !paused && <button type="button" aria-label={playing ? "إيقاف العرض التلقائي" : "تشغيل العرض التلقائي"} onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

export function PortfolioHero({ copy, projects, slogan, showArtwork = true }: { copy: HeroCopy; projects: WorkWallProject[]; slogan: string; showArtwork?: boolean }) {
  const parts = splitTitleWithHighlight(copy.title, copy.highlightPhrase);
  const items = getItems(projects).slice(0, 12);

  return (
    <section id="hero" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.slogan} dir="ltr">{slogan}</p>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 id="hero-heading">{parts.before}{parts.highlight && <span>{parts.highlight}</span>}{parts.after}</h1>
          <p className={styles.description}>{copy.description}</p>
          <div className={styles.ctas}>
            <BrandButton href="#work" size="lg">{copy.primaryCta}</BrandButton>
            <BrandButton href="#packages" size="lg" variant="secondary">{copy.secondaryCta}</BrandButton>
          </div>
        </div>
        {showArtwork && <><Coverflow items={items} />
        <p className={styles.heroFoot}>{projects.length ? "SELECTED WORK / مختارات من أعمالنا" : "CREATIVE STUDIES / نماذج توضيحية من اتجاهات التصميم"}</p></>}
      </div>
    </section>
  );
}

export function PortfolioRail({ projects, showreelOnly = false }: { projects: WorkWallProject[]; showreelOnly?: boolean }) {
  const items = getItems(projects);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const rail = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const hasVideo = projects.some(project => project.primaryMediaType === "VIDEO");
  const hasImage = projects.some(project => project.primaryMediaType !== "VIDEO");
  const effectiveFilter = hasVideo && hasImage ? filter : "all";
  const filtered = items.filter(item => effectiveFilter === "all" || (effectiveFilter === "video" ? item.project?.primaryMediaType === "VIDEO" : item.project?.primaryMediaType !== "VIDEO"));
  const reel = projects.find(project => project.primaryMediaType === "VIDEO" && isUsableMediaUrl(project.primaryMediaUrl));

  function scroll(delta: number) {
    const node = rail.current;
    if (node) node.scrollBy({ left: -delta * node.clientWidth * 0.8, behavior: reduced ? "instant" : "smooth" });
  }

  if (showreelOnly) {
    if (!reel?.primaryMediaUrl) return null;
    return (
      <section className={styles.railSection} aria-labelledby="showreel-heading">
        <div className={styles.reel} style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
          <div>
            <p className={styles.eyebrow}>MOTION / SHOWREEL</p>
            <h3 id="showreel-heading">{reel.title}</h3>
            <p className={styles.description}>{reel.summary}</p>
            <Link href={"/work/" + reel.slug} className={styles.detailLink}>تفاصيل المشروع <ArrowUpLeft size={17} /></Link>
          </div>
          <ResilientVideo src={reel.primaryMediaUrl} poster={videoPoster(reel.primaryMediaUrl,reel.primaryThumbnailUrl,reel.coverImageUrl)} label={reel.title} className="w-full aspect-video object-contain rounded-2xl" />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.railSection} aria-labelledby="creative-rail-heading">
      <div className={styles.railHeader}>
        <div>
          <p className={styles.eyebrow}>THE CREATIVE GALLERY</p>
          <h2 id="creative-rail-heading">أفكار مختلفة.<br /><span>في كل فريم.</span></h2>
          <p className={styles.description}>{projects.length ? "اتفرّج على التصاميم والحملات من زوايا مختلفة." : "نماذج تصميم توضيحية لاستكشاف الأساليب البصرية، وليست أعمال عملاء."}</p>
        </div>
        <div className={styles.controls} dir="ltr">
          <button type="button" onClick={() => scroll(1)} aria-label="عرض المزيد من التصاميم"><ArrowLeft size={21} /></button>
          <button type="button" onClick={() => scroll(-1)} aria-label="الرجوع إلى التصاميم السابقة"><ArrowRight size={21} /></button>
        </div>
      </div>
      {hasVideo && hasImage && (
        <div className={styles.filters} aria-label="نوع الأعمال">
          {([{ key: "all", title: "الكل" }, { key: "image", title: "تصاميم" }, { key: "video", title: "فيديو" }] as const).map(option => (
            <button type="button" key={option.key} aria-pressed={effectiveFilter === option.key} onClick={() => { setFilter(option.key); rail.current?.scrollTo({ left: 0, behavior: "instant" }); }}>{option.title}</button>
          ))}
        </div>
      )}
      <div ref={rail} className={styles.rail} dir="rtl" tabIndex={0} aria-label="أعمال قابلة للتمرير أفقيًا">
        {filtered.map(item => (
          <article key={item.id} className={styles.railCard}>
            {item.project ? (
              <Link href={"/work/" + item.project.slug} className={styles.railArt} aria-label={"عرض " + item.title}><Artwork item={item} /></Link>
            ) : <div className={styles.railArt}><Artwork item={item} /></div>}
            <div className={styles.railMeta}>
              <div><span>{item.label}</span><h3>{item.title}</h3></div>
              {item.project && <Link href={"/work/" + item.project.slug} aria-label={"تفاصيل " + item.title}><ArrowUpLeft size={22} /></Link>}
            </div>
          </article>
        ))}
      </div>
      {reel?.primaryMediaUrl && (
        <div className={styles.reel}>
          <div>
            <p className={styles.eyebrow}>MOTION / SHOWREEL</p>
            <h3>{reel.title}</h3>
            <p className={styles.description}>{reel.summary}</p>
            <Link href={"/work/" + reel.slug} className={styles.detailLink}>تفاصيل المشروع <ArrowUpLeft size={17} /></Link>
          </div>
          <ResilientVideo src={reel.primaryMediaUrl} poster={videoPoster(reel.primaryMediaUrl,reel.primaryThumbnailUrl,reel.coverImageUrl)} label={reel.title} className="w-full aspect-video object-contain rounded-2xl" />
        </div>
      )}
    </section>
  );
}
