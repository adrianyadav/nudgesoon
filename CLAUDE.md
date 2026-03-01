# NudgeSoon — Project Context

## Design Context

### Users
Everyday people who need to track things with expiry dates: passports, gym memberships, food, medicine, licenses, subscriptions. They're not power users — they want zero friction. The job to be done is simple: add something, be reminded before it expires, never be caught off guard. They're likely using the app briefly and occasionally, not as a daily work tool. The emotional need is **calm confidence** — knowing things are handled without anxiety.

### Brand Personality
**Gentle, trustworthy, minimal.**

- Voice: Reassuring, not alarming. Uses soft language ("nudge", "approaching") rather than urgent language ("warning", "danger").
- Tone: Friendly and clear. Like a reliable reminder on a fridge magnet, not a corporate app.
- Emotional goal: Users feel taken care of, not stressed. The UI should reduce anxiety, not amplify it.

### Aesthetic Direction
The current direction is right — refine it, don't redirect it.

**What defines the look:**
- Glassmorphism with restraint: `backdrop-blur`, semi-transparent cards (`bg-card/80-90`)
- Subtle texture: grain overlay (0.5 opacity), mesh gradients, dot patterns — atmosphere without distraction
- Floating animated blobs (primary teal at low opacity) for a living-but-calm background
- Card backgrounds: contextual imagery (passport, food, etc.) with gradient overlays for readability
- Typography: Geist Sans (Vercel's typeface) — clean, modern, legible
- Border radius: `0.75rem` base, scaling up to `1.5rem+` for larger containers
- Primary: `oklch(0.65 0.18 200)` — teal/cyan that reads as trustworthy and calm, not medical blue
- Both light and dark modes supported (light is primary design target)

**Status system (do not deviate from this visual language):**
- Safe: Emerald/Green — confidence
- Approaching: Amber/Orange — gentle attention
- Critical: Red/Rose — clear urgency (but not panic)

**Anti-references — explicitly avoid:**
- Generic SaaS aesthetic: purple gradients, floating MacBook screenshots, hero-template layouts
- Clinical/medical look: sterile white + blue without personality, hospital-software vibes
- Anxiety-inducing patterns: blinking warnings everywhere, countdown urgency, aggressive CTAs

### Design Principles

1. **Gentle by default** — Every visual decision should reduce cognitive load, not add to it. Status indicators inform, they don't alarm. Use color purposefully.

2. **Minimal signal, maximum clarity** — Strip to the essential information. The item name, the year, and the status are the hierarchy. Decoration supports; it never competes.

3. **Cards are the hero** — The expiry item card is the primary UI unit. All design investment should flow toward making cards feel personal, readable, and satisfying to interact with.

4. **WCAG 2.1 AA always** — All text/background combinations must meet AA contrast ratios. Interactive elements need visible focus states. Status colors must not be the only signal (always paired with icons and text).

5. **Consistent motion language** — Transitions: `duration-200–300`, `ease-in-out`. Hover: subtle scale (`1.02`) and lift (`-translate-y-1`). Nothing abrupt. Nothing that loops unless ambient (floating blobs). Framer Motion for page-level animations only.

### Key Files for Design Work
- `app/globals.css` — All CSS custom properties (design tokens), texture classes, animation keyframes
- `lib/expiry-utils.ts` — Status color tokens (`getStatusColors`, `getAccentCardColors`)
- `components/expiry-item-card.tsx` — Primary card component (the design centerpiece)
- `components/landing-page.tsx` — Marketing page layout and hero section
- `components/ui/` — shadcn/ui component overrides (New York style)
- `components.json` — shadcn config (baseColor: neutral, New York style)
