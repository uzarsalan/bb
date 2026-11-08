import { describe, expect, it } from "vitest";
import { localhostLinkRewriteExample } from "./localhost-link-rewrite-description";

describe("localhostLinkRewriteExample", () => {
  it("shows the exact destination for the current host", () => {
    expect(localhostLinkRewriteExample("100.64.158.8")).toEqual({
      href: "http://localhost:3000/",
      rewrittenHref: "http://100.64.158.8:3000/",
    });
  });

  it("hides the setting on getbb.app hosts", () => {
    expect(localhostLinkRewriteExample("asdf.getbb.app")).toBeNull();
  });

  it("shows the destination on .localhost hosts", () => {
    expect(localhostLinkRewriteExample("sawyer.localhost")).toEqual({
      href: "http://localhost:3000/",
      rewrittenHref: "http://sawyer.localhost:3000/",
    });
  });

  it("hides the setting when localhost is already the current hostname", () => {
    expect(localhostLinkRewriteExample("localhost")).toBeNull();
  });
});
