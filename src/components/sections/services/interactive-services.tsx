"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, ArrowLeft, Lightbulb, PenTool, Layers3, TrendingUp } from "lucide-react";
import { useMarketingMotionPaused } from "@/components/motion/marketing-motion-context";
import { LeadOpenButton } from "@/components/lead/lead-open-button";
import { canUseNextImage } from "@/lib/media/public-media";
import type { ServiceCategoryEcosystem } from "@/server/services/project.service";
import styles from "./interactive-services.module.css";

const art = {
  THINK: { icon: Lightbulb, word: "IDEAS", sub: "STRATEGY / DIRECTION", tone: "think" },
  CREATE: { icon: PenTool, word: "MAKE.", sub: "CONTENT / DESIGN", tone: "create" },
  BUILD: { icon: Layers3, word: "FORM.", sub: "IDENTITY / SYSTEMS", tone: "build" },
  GROW: { icon: TrendingUp, word: "GROW.", sub: "PERFORMANCE / GROWTH", tone: "grow" },
} as const;

function ServiceVisual({ group }: { group: ServiceCategoryEcosystem }) {
  const meta = art[group.category];
  const Icon = meta.icon;
  const paused = useMarketingMotionPaused();
  const stage = useRef<HTMLDivElement>(null);
  function reset() {
    stage.current?.style.setProperty("--rx", "0deg");
    stage.current?.style.setProperty("--ry", "0deg");
    stage.current?.style.setProperty("--px", "50%");
    stage.current?.style.setProperty("--py", "50%");
  }
  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (paused || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    const node = event.currentTarget;
    node.style.setProperty("--rx", ((0.5 - y) * 9) + "deg");
    node.style.setProperty("--ry", ((x - 0.5) * 12) + "deg");
    node.style.setProperty("--px", x * 100 + "%");
    node.style.setProperty("--py", y * 100 + "%");
  }
  return (
    <div ref={stage} className={styles.visual} data-tone={meta.tone} data-paused={paused} onPointerMove={tilt} onPointerLeave={reset}>
      <div className={styles.spotlight} aria-hidden="true" />
      <div className={styles.visualLabel} aria-hidden="true">CM / {meta.sub}</div>
      <div className={styles.artStack}>
        <div className={styles.backCard} aria-hidden="true" />
        <div className={styles.backCardTwo} aria-hidden="true" />
        {group.projectPreview ? (
          <Link href={"/work/" + group.projectPreview.slug} className={styles.frontCard} aria-label={"عرض مشروع " + group.projectPreview.title}>
            {canUseNextImage(group.projectPreview.coverImageUrl) ? (
              <Image src={group.projectPreview.coverImageUrl} alt={group.projectPreview.coverImageAlt} fill sizes="(max-width: 800px) 75vw, 520px" className={styles.cover} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={group.projectPreview.coverImageUrl} alt={group.projectPreview.coverImageAlt} loading="lazy" className={styles.cover} />
            )}
            <span className={styles.projectLabel}>{group.projectPreview.title} <ArrowUpLeft size={17} aria-hidden="true" /></span>
          </Link>
        ) : (
          <div className={styles.frontCard} role="img" aria-label={"تكوين بصري توضيحي لخدمات " + group.labelEn}>
            <div className={styles.poster} dir="ltr">
              <span>CREATIVE MARKETING / STUDIO</span>
              <Icon size={70} strokeWidth={1.3} aria-hidden="true" />
              <strong>{meta.word}</strong>
              <small>{meta.sub}</small>
            </div>
          </div>
        )}
      </div>
      <span className={styles.visualFoot}>{group.projectPreview ? "SELECTED PROJECT / عمل مرتبط" : "SERVICE CONCEPT / تصور بصري للخدمة"}</span>
    </div>
  );
}

export function InteractiveServices({ ecosystem }: { ecosystem: ServiceCategoryEcosystem[] }) {
  const [selected, setSelected] = useState(0);
  const paused = useMarketingMotionPaused();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  if (!ecosystem.length) return (
    <section id="services" className={styles.section} aria-labelledby="services-heading">
      <header className={styles.header}><p>OUR CREATIVE SYSTEM</p><h2 id="services-heading">كل فكرة تبدأ بخطوة.</h2></header>
      <LeadOpenButton source="services_empty" isCustom>احكِ لنا عن مشروعك</LeadOpenButton>
    </section>
  );
  const index = Math.min(selected, ecosystem.length - 1);
  const group = ecosystem[index];
  return (
    <section id="services" aria-labelledby="services-heading" className={styles.section} data-paused={paused}>
      <header className={styles.header}>
        <p>OUR CREATIVE SYSTEM / 02</p>
        <h2 id="services-heading">من أول فكرة.<br /><span>لحد ما البراند يكبر.</span></h2>
      </header>
      <div className={styles.tabs} role="tablist" aria-label="مجالات الخدمات">
        {ecosystem.map((item, i) => {
          const Icon = art[item.category].icon;
          return (
            <button key={item.category} ref={node => { buttons.current[i] = node; }} id={"service-tab-" + item.category} role="tab" type="button" aria-selected={index === i} aria-controls="service-studio-panel" tabIndex={index === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={event => {
              let next: number;
              if (event.key === "ArrowLeft") next = (i + 1) % ecosystem.length;
              else if (event.key === "ArrowRight") next = (i - 1 + ecosystem.length) % ecosystem.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = ecosystem.length - 1;
              else return;
              event.preventDefault();
              setSelected(next);
              buttons.current[next]?.focus();
            }}>
              <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
              <span>{item.labelEn}</span>
              <small>{["01","02","03","04"][i]}</small>
            </button>
          );
        })}
      </div>
      <div id="service-studio-panel" role="tabpanel" aria-labelledby={"service-tab-" + group.category} tabIndex={0} className={styles.panel}>
        <div className={styles.content} key={group.category}>
          <div className={styles.copy}>
            <span className={styles.kicker}>{group.labelEn} / {String(index + 1).padStart(2, "0")}</span>
            <h3>{group.titleAr}</h3>
            <p>{group.descriptionAr}</p>
            <ul className={styles.serviceList}>
              {group.services.map(service => (
                <li key={service.id}>
                  <span className={styles.dot} aria-hidden="true" />
                  <div><strong>{service.nameAr}</strong><p>{service.summaryAr}</p></div>
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <LeadOpenButton source={"service_studio_" + group.category.toLowerCase()} isCustom>ابدأ مشروعك <ArrowLeft size={17} aria-hidden="true" /></LeadOpenButton>
              <Link href="#packages" className={styles.link}>اكتشف الباكدجات</Link>
            </div>
          </div>
          <ServiceVisual group={group} />
        </div>
      </div>
    </section>
  );
}
