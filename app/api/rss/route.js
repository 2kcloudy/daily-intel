import { getAllDates, getDigest } from "@/lib/storage";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-intel-nu.vercel.app";

  try {
    const dates = await getAllDates();
    const recentDates = dates.slice(0, 14);
    const digests = await Promise.all(recentDates.map(d => getDigest(d)));
    const valid = digests.filter(Boolean);

    const items = valid.map(digest => {
      const stories = (digest.stories || []).slice(0, 8).map(s =>
        `<li><a href="${escXml(s.url || "")}">${escXml(s.headline || "")}</a>${s.source ? ` — ${escXml(s.source)}` : ""}</li>`
      ).join("");

      const pubDate = digest.postedAt
        ? new Date(digest.postedAt).toUTCString()
        : new Date(digest.date + "T12:00:00Z").toUTCString();

      return `
    <item>
      <title>Daily Intel Finance — ${escXml(digest.date)}</title>
      <link>${siteUrl}/${digest.date}</link>
      <description><![CDATA[
        ${digest.marketPulse ? `<p><strong>Market Pulse:</strong> ${digest.marketPulse}</p>` : ""}
        <ul>${stories}</ul>
      ]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${siteUrl}/${digest.date}</guid>
    </item>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Daily Intel — Finance &amp; Markets</title>
    <link>${siteUrl}</link>
    <description>AI-curated daily finance and investment intelligence</description>
    <language>en-US</language>
    <ttl>60</ttl>
    <atom:link href="${siteUrl}/api/rss" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/icon-192.png</url>
      <title>Daily Intel</title>
      <link>${siteUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (err) {
    console.error("RSS error:", err);
    return new Response("Error generating feed", { status: 500 });
  }
}

function escXml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
