# Notes: my design log

**Live URL (Vercel):** _paste your deployed link here_

## 1. Route and storage choice

- What route did you create for the payment page, and why that name/location?
> I created a `premium` folder with `page.js` inside it, which maps to the `/premium` route. The Navbar already linked to `/premium`, so this was the natural location. Next.js file-based routing means no extra config needed — just dropping a `page.js` in the folder is enough.
- Where did you store the "this user is premium" flag (`localStorage`,
  `sessionStorage`, a cookie, something else)?
> I store this flag in two cookies: `isPremium` (value: `"true"`) and `premiumPlan` (value: `"monthly"` or `"lifetime"`), both with a 1-year `max-age`.
- Why that one? What would have broken or felt wrong with the alternatives?
> If we use `sessionStorage`, after closing the tab the flag will disappear — wrong for a one-time purchase. `localStorage` persists fine but only lives on the client, so a Server Component or middleware can never read it. A cookie travels with every request, which means in the future `layout.js` could read it server-side via Next.js `cookies()` and skip rendering `<AdBanner />` entirely — no client-side flash at all.

## 2. Server vs Client Components

- List the components/files you touched. For each, mark it **Server** or
  **Client**.
> | File | Type |
> |---|---|
> | `app/layout.js` | **Server** |
> | `app/page.js` (shop) | **Server** |
> | `app/components/Navbar.js` | **Client** |
> | `app/components/AdBanner.js` | **Client** |
> | `app/components/PremiumContext.js` | **Client** |
> | `app/premium/page.js` | **Client** |
- Which ones were *forced* to be Client Components, and what forced them?
  (state, event handlers, browser-only APIs like `localStorage`...)
> `PremiumContext` — uses `useState`, `useEffect`, and `document.cookie`. `AdBanner` — reads from context (`usePremium`), which requires being inside the client tree. `Navbar` — uses `usePathname` and `usePremium`, both browser-only hooks. `PremiumPage` — controlled form with `useState`, submit handler, and calls `setPremium()` from context.
- What did you gain by keeping the rest on the server?
> The shop `page.js` and `layout.js` stay as Server Components, so the product grid HTML is generated on the server with zero JS shipped to the browser for those parts. Faster initial paint, no hydration cost for the largest visible chunk of the page.

## 3. The first-render problem

- Did you hit a hydration mismatch or a "localStorage is not defined" error?
  Describe what happened.
> Yes. The server renders the page before the browser has run any JavaScript, so `document.cookie` is not accessible at render time. Without a fix, the server renders "show ads" while the browser immediately wants to render "hide ads" — React throws a hydration mismatch warning.
- How did you fix it? (e.g. render a known state first, then read storage after
  the component mounts.)
> `PremiumContext` starts with `isPremium = false` (safe, server-matching value). A `useEffect` runs only after the component mounts in the browser, reads the cookie, and calls `setIsPremium(true)` if the flag is present. React re-renders once with the correct value — no mismatch. `PremiumPage` also uses a `checked` boolean that stays `false` until the effect fires, returning `null` on the first render to prevent a flash of the form for already-premium users.
- How do you know it's actually fixed? (what you checked in the console/UI)
> No hydration warnings in the browser console. Ads disappear on refresh without any React errors, and the Premium badge appears in the navbar correctly after page reload.

## 4. How the pieces connect

- Walk through one full flow in 2-3 sentences: user submits the form, then what
  happens, ending with the ads disappearing and staying gone after a refresh.
> The user picks a plan (Monthly or Lifetime), fills out the form, and clicks Pay. `handleSubmit` validates all fields, then calls `setPremium(selectedPlan)` from context, which writes two cookies (`isPremium=true`, `premiumPlan=lifetime`) and updates the shared React state. `AdBanner` reads `isPremium` from the same context and immediately returns `null` — no refresh needed. On any future visit, `PremiumContext`'s `useEffect` reads the cookies on mount and restores the premium state, so the ads stay gone.

## 5. If I had another hour

- One thing you'd change, add, or clean up, and why.
> I would read the `isPremium` cookie in `layout.js` server-side via Next.js `cookies()` and decide whether to include `<AdBanner />` in the HTML at all — rather than rendering it and hiding it client-side after mount. This would eliminate the brief one-frame flash where ads are visible before the `useEffect` fires, and it would move the gating logic to the server where it belongs.