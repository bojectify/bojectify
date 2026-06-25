import styles from './page.module.scss';

export default function Home() {
  return (
    <section className={styles.content}>
      <h1>Bojectify</h1>
      <p>
        Fitted-furniture builder — platform shell. The 3D canvas will mount
        here.
      </p>
    </section>
  );
}
