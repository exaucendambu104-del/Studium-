"use client";
/** Remplacement de `next/link` : une ancre vers le hash correspondant. */
import { forwardRef } from "react";
import { navigate } from "./navigation";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};

const Link = forwardRef<HTMLAnchorElement, Props>(function Link(
  // prefetch/replace/scroll sont déstructurés uniquement pour les retirer
  // de `rest` : ce sont des props Next, pas des attributs HTML valides.
  { href, prefetch: _p, replace: _r, scroll: _s, onClick, children, ...rest },
  ref
) {
  return (
    <a
      ref={ref}
      href={`#${href}`}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
