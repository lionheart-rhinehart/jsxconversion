**SectionHeading** — opens a marketing section (mono eyebrow + condensed display title + subtitle; wrap words in `.hl` for bolt emphasis). **Testimonial** — parent-review card (stars, quote, author + Avatar). **Avatar** — image or auto-initials.

```jsx
<SectionHeading eyebrow="The Programs" align="center"
  title={<>Built for <span className="hl">every athlete</span></>}
  subtitle="Speed, strength, conditioning — coached one athlete at a time." />

<Testimonial rating={5} name="Julie E" role="Hockey parent · 6 yrs"
  quote="My expectations have been exceeded… their strength, balance and speed are amazing." />

<Avatar name="Jim Herrick" size="lg" ring />
```
