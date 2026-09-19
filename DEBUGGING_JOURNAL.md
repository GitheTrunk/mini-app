## Bug 1 — Null product state crash

### Symptom
The application rendered a blank page and failed while building the product list.

### Tool
Chrome DevTools — Sources / Breakpoint

### What it showed
The breakpoint showed that `products` was `null` immediately before the code attempted to call `.map()`.

### Root cause
The product state was initialized to `null`, but the rendering logic expected an array.

### Fix
I restored the product state to a `Product[]` initialized with the product data.