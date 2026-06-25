import { SITE_CONFIG } from '@siteConfig';
import styles from './page.module.scss';

export default function Home() {
  return (
    <section className={styles.content}>
      <h1>{SITE_CONFIG.BRAND}</h1>
      <p>Platform shell — replace this home page.</p>
    </section>
  );
}
