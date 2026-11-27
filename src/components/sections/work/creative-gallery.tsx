"use client";

import { useMemo, useState } from "react";
import { ResilientImage } from "@/components/ui/resilient-media";
import Link from "next/link";
import { ArrowUpLeft, Maximize2, Play, Images } from "lucide-react";
import { CaseStudyLightbox } from "@/components/sections/case-study/case-study-lightbox";
import { buildCreativeGallery, type CreativeGalleryProject, type Comparison, type GalleryEntry } from "@/lib/content/creative-gallery";
import { mediaAspectRatio } from "@/lib/media/portfolio-layout";
import { videoPoster } from "@/lib/media/public-media";

import styles from "./creative-gallery.module.css";

function MediaImage({ url, alt, sizes }: { url: string; alt: string; sizes: string }) {
  return <ResilientImage src={url} alt={alt} sizes={sizes} className={styles.image} />;
}
function preview(entry: GalleryEntry) {
  if (entry.type === "IMAGE") return entry.url;
  return videoPoster(entry.url,entry.thumbnailUrl,entry.cover);
}
function ComparePanel({ pair }: { pair: Comparison }) {
  const [position, setPosition] = useState(50);
  return (
    <article className={styles.compareCard}>
      <div className={styles.compareMeta}><div><p>BRAND TRANSFORMATION</p><h3>{pair.title}</h3></div><Link href={"/work/" + pair.slug} className={styles.link}>تفاصيل المشروع <ArrowUpLeft size={17} aria-hidden="true" /></Link></div>
      <div className={styles.compareStage} dir="ltr" style={{aspectRatio:mediaAspectRatio(pair.after.width,pair.after.height,4/3)}}>
        <MediaImage url={pair.before.url} alt={pair.before.altText || "قبل التطوير"} sizes="(max-width: 768px) 95vw, 750px" />
        <div className={styles.afterLayer} style={{ clipPath: "inset(0 " + (100 - position) + "% 0 0)" }}>
          <MediaImage url={pair.after.url} alt={pair.after.altText || "بعد التطوير"} sizes="(max-width: 768px) 95vw, 750px" />
        </div>
        <span className={styles.beforeLabel}>قبل / BEFORE</span><span className={styles.afterLabel}>بعد / AFTER</span>
        <div className={styles.divider} style={{ left: position + "%" }} aria-hidden="true"><span>↔</span></div>
        <input className={styles.compareRange} type="range" min={0} max={100} value={position} onChange={event => setPosition(Number(event.target.value))} aria-label="نسبة عرض التصميم بعد التطوير" aria-valuetext={position + "% بعد التطوير"} />
      </div>
      <p className={styles.compareHint}>اسحب الفاصل يمين أو شمال علشان تشوف الفرق، أو استخدم أسهم الكيبورد.</p>
    </article>
  );
}

export function CreativeGallery({ projects, sectionId = "creative-gallery", showComparisons = true }: { projects: CreativeGalleryProject[]; sectionId?: string; showComparisons?: boolean }) {
  const { entries, comparisons } = useMemo(() => buildCreativeGallery(projects), [projects]);
  const [filter, setFilter] = useState<"all" | "IMAGE" | "VIDEO">("all");
  const [limit, setLimit] = useState(9);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [pairIndex, setPairIndex] = useState(0);
  const effectiveFilter = entries.some(entry => entry.type === filter) ? filter : "all";
  const filtered = entries.filter(entry => effectiveFilter === "all" || entry.type === effectiveFilter);
  const shown = filtered.slice(0, limit);
  const pair = comparisons[pairIndex % Math.max(1, comparisons.length)];
  const hasImages = entries.some(entry => entry.type === "IMAGE");
  const hasVideos = entries.some(entry => entry.type === "VIDEO");

  return (
    <section id={sectionId} className={styles.section} aria-labelledby="creative-gallery-heading">
      <header className={styles.header}>
        <div><p className={styles.kicker}>CREATIVE GALLERY</p><h2 id="creative-gallery-heading">معرض التصميمات.</h2></div>
        <p className={styles.description}>{entries.length ? "شوف التصميمات والفيديوهات بالحجم الكامل." : "نعمل حاليًا على تجهيز الأعمال للنشر."}</p>
      </header>
      {hasImages && hasVideos && <div className={styles.filters} aria-label="فلترة المعرض">
        {([{ value: "all", label: "الكل" }, { value: "IMAGE", label: "تصميمات" }, { value: "VIDEO", label: "فيديوهات" }] as const).map(option => <button type="button" key={option.value} aria-pressed={effectiveFilter === option.value} onClick={() => { setFilter(option.value); setLimit(9); setOpenIndex(null); }}>{option.label}</button>)}
      </div>}
      <div className={styles.grid} data-gallery-count={Math.min(shown.length,3)}>
        {shown.length ? shown.map((entry, index) => {
          const thumb = preview(entry);
          return (
            <article key={entry.id} className={styles.tile}>
              <button type="button" className={styles.tileButton} style={{aspectRatio:mediaAspectRatio(entry.width,entry.height,1)}} onClick={() => setOpenIndex(index)} aria-label={"فتح " + (entry.altText || entry.projectTitle)}>
                {thumb ? <MediaImage url={thumb} alt={entry.altText || entry.projectTitle} sizes="(max-width: 600px) 48vw, (max-width: 1000px) 33vw, 440px" /> : <div className={styles.videoPlaceholder}><Play size={40} aria-hidden="true" /><span>VIDEO</span></div>}
                <span className={styles.tileIcon}>{entry.type === "VIDEO" ? <Play size={19} aria-hidden="true" /> : <Maximize2 size={19} aria-hidden="true" />}</span>
              </button>
              <div className={styles.tileMeta}><Link href={"/work/" + entry.slug}>{entry.projectTitle}</Link><ArrowUpLeft size={15} aria-hidden="true" /></div>
            </article>
          );
        }) : null}
      </div>
      <div className={styles.galleryActions}>{filtered.length > limit && <button type="button" className={styles.more} onClick={() => setLimit(value => value + 9)}><Images size={18} aria-hidden="true" /> عرض المزيد</button>}{projects.length > 0 && <Link href="/work" className={styles.link}>كل المشاريع <ArrowUpLeft size={17} /></Link>}</div>
      {showComparisons && pair && <div className={styles.compareSection}>
        <p className={styles.kicker}>BEFORE / AFTER</p>
        <h2 className={styles.compareHeading}>الفرق واضح.</h2>
        <ComparePanel key={pair.id} pair={pair} />
        {comparisons.length > 1 && <div className={styles.pairActions}><button type="button" onClick={() => setPairIndex(value => (value + comparisons.length - 1) % comparisons.length)}>السابق</button><span>{pairIndex % comparisons.length + 1} / {comparisons.length}</span><button type="button" onClick={() => setPairIndex(value => (value + 1) % comparisons.length)}>التالي</button></div>}
      </div>}
      <CaseStudyLightbox items={filtered.map(entry => ({ ...entry, thumbnailUrl: entry.type === "VIDEO" ? preview(entry) : entry.thumbnailUrl, caption: entry.caption || entry.projectTitle }))} openIndex={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </section>
  );
}
