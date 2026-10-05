import Link from "next/link";
import { faqItems, type FaqItem } from "@/lib/content";

export function FaqList({ items = faqItems }: { items?: FaqItem[] }) {
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>
            {item.answer}
            {item.href ? (
              <>
                {" "}
                <Link href={item.href}>{item.hrefLabel || "Read more"}</Link>
              </>
            ) : null}
          </p>
        </details>
      ))}
    </div>
  );
}
