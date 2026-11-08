import { rewriteLocalhostLinkHref } from "@bb/client-core";

const EXAMPLE_HREF = "http://localhost:3000/";

export interface LocalhostLinkRewriteExample {
  href: string;
  rewrittenHref: string;
}

export function localhostLinkRewriteExample(
  currentHostname: string | undefined,
): LocalhostLinkRewriteExample | null {
  if (currentHostname === undefined) {
    return null;
  }

  const rewrittenHref = rewriteLocalhostLinkHref({
    currentHostname,
    enabled: true,
    href: EXAMPLE_HREF,
  });
  if (rewrittenHref === undefined || rewrittenHref === EXAMPLE_HREF) {
    return null;
  }

  return { href: EXAMPLE_HREF, rewrittenHref };
}
