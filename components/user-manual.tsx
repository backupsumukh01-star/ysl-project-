"use client";

import { useEffect, useMemo, useState } from "react";
import { PageBack } from "@/components/page-back";
import { articleText, manualGroups, type ManualArticle, type ManualPart } from "@/lib/manual-guide";

function ManualImage({ name }: { name: string }) {
  const alt = name.replace(/\.jpg$/i, "").replaceAll("-", " ");
  return (
    <figure className="manual-img">
      <img src={`/images/manual/${name}`} alt={alt} />
    </figure>
  );
}

function Parts({ parts }: { parts: ManualPart[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.kind === "img") return <ManualImage key={part.name} name={part.name} />;
        if (part.kind === "strong") return <p key={index} className="manual-strong">{part.text}</p>;
        if (part.kind === "steps") {
          return (
            <ol key={index} className="manual-steps">
              {part.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          );
        }
        if (part.kind === "table") {
          return (
            <table key={index} className="manual-table">
              <thead>
                <tr>
                  {part.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {part.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        if (part.kind === "list" || part.kind === "sublist") {
          return (
            <ul key={index} className={part.kind === "sublist" ? "manual-sub" : undefined}>
              {part.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{part.text}</p>;
      })}
    </>
  );
}

function articleFromLocation() {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return null;
  for (const group of manualGroups) {
    if (group.articles.some((article) => article.id === id)) return id;
  }
  return null;
}

export function UserManual() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setOpenId(articleFromLocation());
    function onPop() {
      setOpenId(articleFromLocation());
      window.scrollTo({ top: 0 });
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const needle = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!needle) return manualGroups;
    return manualGroups
      .map((group) => ({
        ...group,
        articles: group.articles.filter((article) => articleText(article).toLowerCase().includes(needle)),
      }))
      .filter((group) => group.articles.length > 0);
  }, [needle]);

  const open = useMemo(() => {
    if (!openId) return null;
    for (const group of manualGroups) {
      const found = group.articles.find((article) => article.id === openId);
      if (found) return found;
    }
    return null;
  }, [openId]);

  function choose(article: ManualArticle) {
    const next = `${window.location.pathname}${window.location.search}#${article.id}`;
    window.history.pushState({ manualArticle: article.id }, "", next);
    setOpenId(article.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function close() {
    if (articleFromLocation()) {
      const before = window.location.href;
      window.history.back();
      window.setTimeout(() => {
        if (window.location.href !== before) return;
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        setOpenId(null);
        window.scrollTo({ top: 0 });
      }, 60);
      return;
    }
    setOpenId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="manual-app">
      {open ? (
        <article className="manual-article">
          <button type="button" className="manual-back" onClick={close}>
            <BackMark />
            All topics
          </button>
          <h1>{open.title}</h1>
          <Parts parts={open.parts} />
          <button type="button" className="manual-back-end" onClick={close}>
            <BackMark />
            All topics
          </button>
        </article>
      ) : (
        <>
          <PageBack href="/shop">All products</PageBack>
          <p className="kicker">Guide</p>
          <h1>User manual</h1>
          <p className="lede">Setup, cartridges, the companion app, and care.</p>
          <label className="manual-search">
            <span className="manual-sr">Search user manual</span>
            <input value={query} placeholder="Search the manual" onChange={(event) => setQuery(event.target.value)} />
            <SearchIcon />
          </label>
          {needle ? <p className="manual-results">{groups.length ? "Matching topics" : "No matching topics"}</p> : null}
          {groups.map((group) => (
            <section key={group.title}>
              {group.articles[0]?.title === group.title ? null : <h2>{group.title}</h2>}
              <ol className="guide-steps">
                {group.articles.map((article) => (
                  <li key={article.id}>
                    <button type="button" onClick={() => choose(article)}>
                      <strong>{article.title}</strong>
                      {article.preview ? <small>{article.preview}</small> : null}
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function BackMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M10 3.5 5.5 8 10 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12.5 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
