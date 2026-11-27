import Link from "next/link";
import { ArrowUpLeft, Scissors, GraduationCap, BookOpen } from "lucide-react";
import { niches, type Niche } from "@/lib/content/niches";
import {defaultIndustryContent,type IndustryContent} from "@/lib/content/industry-content";
import {ResilientImage} from "@/components/ui/resilient-media";
import styles from "./niche-showcase.module.css";

const icons = {salon:Scissors,teacher:GraduationCap,books:BookOpen};
const visualText = {salon:["FRESH.","CUT.","STYLE / IDENTITY"],teacher:["LEARN.","SMART.","EDUCATION / CONTENT"],books:["TEACH.","BOOK.","EDITORIAL / DESIGN"]};

export function NicheVisual({ niche }: { niche: Niche }) {
  const Icon = icons[niche.visual];
  const words = visualText[niche.visual];
  return (
    <div className={styles.visual} data-theme={niche.visual} aria-hidden="true" dir="ltr">
      <div className={styles.glow} />
      <div className={styles.back} />
      <div className={styles.poster}>
        <span>CM / CREATIVE STUDIO</span>
        <Icon size={56} strokeWidth={1.4} />
        <strong>{words[0]}<br />{words[1]}</strong>
        <small>{words[2]}</small>
      </div>
      <span className={styles.concept}>VISUAL CONCEPT</span>
    </div>
  );
}

export function NicheShowcase({content=defaultIndustryContent()}:{content?:IndustryContent}={}) {
  return (
    <section id="industries" aria-labelledby="industries-heading" className={styles.section}>
      <p className={styles.kicker}>{content.kicker}</p>
      <h2 id="industries-heading">{content.title} {content.highlight&&<span>{content.highlight}</span>}</h2>
      <p className={styles.intro}>{content.description}</p>
      <div className={styles.grid}>
        {content.order.map(id=>{const niche=niches.find(n=>n.slug===id)!;const card=content.cards[id];return (
          <Link key={niche.slug} href={niche.path} className={styles.card}>
            {card.imageUrl?<div className={styles.customVisual}><ResilientImage src={card.imageUrl} alt={card.imageAlt||card.label} sizes="(max-width:800px) 100vw, 33vw" fit="contain"/></div>:<NicheVisual niche={niche} />}
            <div className={styles.meta}><div><span>{card.eyebrow}</span><h3>{card.label}</h3></div><ArrowUpLeft size={23} aria-hidden="true" /></div>
          </Link>
        );})}
      </div>
    </section>
  );
}
