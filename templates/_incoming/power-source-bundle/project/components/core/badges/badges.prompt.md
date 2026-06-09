**Badge** — compact status/label pill (mono, uppercase). **Tag** — heavier filter/category chip, supports `active` and removable `×`.

```jsx
<Badge variant="bolt" dot>Speed School</Badge>
<Badge variant="success">Active Member</Badge>

<Tag active>Strength</Tag>
<Tag onRemove={() => {}}>Hockey</Tag>
```

- Badge variants: electric · bolt · steel · success · danger · neutral · outline
- Tag: `active`, `variant="bolt"`, `onRemove`
