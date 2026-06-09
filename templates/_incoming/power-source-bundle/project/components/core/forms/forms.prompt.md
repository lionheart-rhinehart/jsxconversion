**Input** — labeled text field for forms (lead capture, member login). Leading icon, helper text, and error state. Electric focus ring; required marker is bolt yellow.

```jsx
<Input label="Athlete's name" required placeholder="First & last" />
<Input label="Email" type="email" icon={<i data-lucide="mail" />} helper="We'll send your free sessions here." />
<Input label="Phone" error="Enter a valid phone number." defaultValue="123" />
```
