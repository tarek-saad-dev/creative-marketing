import { BrandLogo } from "@/components/brand/logo";
import styles from "./brand-loading.module.css";

export function BrandLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={styles.shell}>
      <div className={styles.inner}>
        <BrandLogo />
        <span className={styles.slogan} dir="ltr">WE THINK. WE CREATE. YOU GROW.</span>
        <div className={styles.track} aria-hidden="true"><div /></div>
        <p>{label}</p>
      </div>
    </div>
  );
}
