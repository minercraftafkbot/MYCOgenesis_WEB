# Style Guide for Recreating the Homepage in React

This document provides a detailed guide for translating the provided HTML and CSS into a structured and maintainable React application using Next.js.

## 1. Component Structure

Break down the page into the following reusable and modular components:

*   `HomePage`: The main page component that assembles all the sections.
*   `Header`: The sticky navigation bar, including the logo, navigation links, and authentication state.
*   `HeroSection`: The top section with the rotating background images and call-to-action buttons.
*   `ValueProposition`: The section with three key features, each with an icon.
*   `FeaturedProducts`: A section to display a preview of featured products.
*   `AboutSection`: The "About Us" section with an image and descriptive text.
*   `MushroomsSection`: The section detailing mushroom varieties with an alternating layout.
*   `SmartFarmSection`: The section explaining the farm's technology.
*   `ShopSection`: A section to display a preview of shop products.
*   `BlogSection`: A section for the latest blog post previews.
*   `ContactSection`: The contact form.
*   `Footer`: The page footer with copyright and social links.

## 2. Styling Strategy

Your project already uses **Tailwind CSS**, which should be the primary method for styling. For styles that are dynamic or cannot be expressed with Tailwind, use the methods below.

### Custom CSS

The custom CSS from `index.css` should be appended to your existing `myco-react-app/src/app/globals.css` file. This integrates the hero section's background image animation and other global styles.

**Key Custom Classes:**
*   `.hero-bg`, `.hero-bg-image`, `.hero-bg-image.active`: Manages the hero background image rotation and fade effect.
*   `.hero-title`, `.hero-description`: Adds a subtle text shadow for better readability on the hero image.

### Inline Styling

Use inline styles for dynamic properties that change based on component state or props. A perfect example is setting the `backgroundImage` for the hero section's rotating images.

```jsx
<div
  className={`hero-bg-image ${index === currentBgIndex ? 'active' : ''}`}
  style={{ backgroundImage: `url(${src})` }}
></div>
```

## 3. Icons

SVG icons can be handled in two ways:

1.  **Directly in JSX:** For simple icons, you can paste the SVG code directly into your component. This is easy and avoids extra file imports.

    ```jsx
    <svg className="w-12 h-12 mx-auto mb-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    ```

2.  **As Separate Components:** For complex or frequently used icons, save them as `.tsx` files and import them as components. This keeps your main component files cleaner.

## 4. Element Placement and Details

### Header and Logo

*   **Placement:** The header is a sticky element at the top of the page.
*   **Logo:** The logo consists of an `<img>` tag for the icon and a `<span>` for the text, wrapped in a flex container.
    *   Use `next/image` for the logo for optimized loading.
    *   The `MYCOgenesis.svg` file should be placed in the `/public/images/logo/` directory.

    ```jsx
    <div className="flex items-center">
        <Image src="/images/logo/MYCOgenesis.svg" alt="MYCOgenesis Logo" width={48} height={48} className="mr-3" />
        <span className="font-bold text-lg sm:text-xl text-slate-700">MYCOGenesis</span>
    </div>
    ```

*   **Navigation:** Links should use the `next/link` component for client-side routing. The active link can be highlighted based on the current page or scroll position.
*   **Authentication:** The UI should conditionally render different elements based on the user's authentication status (`auth-logged-in` vs. `auth-not-logged-in`).

### Hero Section

*   **Structure:** A relative container (`hero-bg`) holds multiple absolutely positioned `div` elements for the background images and a semi-transparent overlay (`bg-black/60`) for readability.
*   **Content:** The `h1` title, `p` description, and call-to-action `<a>` tags are centered within the overlay.

### Value Proposition Section

*   **Structure:** A three-column grid. Each column contains an SVG icon, a heading, and a paragraph.
*   **Styling:** The icons are styled with `w-12 h-12 mx-auto mb-4 text-teal-600` to center them and apply the brand color.

### About Us Section

*   **Structure:** A two-column grid that places the text on the left and an image on the right.
*   **Image:** Use the `next/image` component for the image to ensure it's optimized.

### Mushrooms Section

*   **Structure:** This section features a series of alternating two-column layouts. On the first row, the image is on the left; on the second, it's on the right. This is achieved by changing the `order` of elements on medium screens and up (`md:order-1`, `md:order-2`).

### Disclaimer

*   **Structure:** A distinctively styled box to draw attention to the legal disclaimer.
*   **Styling:** Achieved with a light background (`bg-amber-100/50`), a prominent left border (`border-l-4 border-amber-500`), and colored text (`text-amber-800`).

### Footer

*   **Structure:** Centered text for the copyright notice and a flex container for the social media and CMS links.

## 5. State Management with React Hooks

### Hero Image Rotator

Use `useState` and `useEffect` to manage the background image rotation.

```jsx
import { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const heroImages = [/* ...image paths... */];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // ... JSX
};
```

### Mobile Menu Toggle

Use `useState` to control the visibility of the mobile menu.

```jsx
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Optional: Add/remove a class from <body> to prevent scrolling
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  return (
    <header>
      <button id="mobile-menu-button" onClick={toggleMenu}>...</button>
      {isMenuOpen && (
        <div id="mobile-menu">...</div>
      )}
    </header>
  );
};
```
