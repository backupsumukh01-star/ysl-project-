import { referenceFaqs } from "@/lib/reference/catalog";

export default function ReferenceFaq() {
  return (
    <div>
      <h1 className="ref-title">FAQ</h1>
      {referenceFaqs.map((item) => (
        <details key={item.question} className="ref-acc">
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
