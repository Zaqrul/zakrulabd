"use client";

import { useState } from "react";
import { PlusMinus } from "@/components/icons";
import { content as t } from "@/lib/content";

const faq = t.faq;

export function Faq() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openQuestion, setOpenQuestion] = useState<string | null>(faq.categories[0].items[0].q);

  const category = faq.categories[activeCategory];

  return (
    <div className="flex flex-col gap-8">
      {/* Category switch: a segmented control on desktop, a scrollable strip on
          phones, so four labels never wrap into a stack of half-empty rows. */}
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <div className="mx-auto flex w-max gap-1 rounded-full border border-border bg-white p-1">
          {faq.categories.map((c, i) => (
            <button
              key={c.label}
              type="button"
              aria-pressed={i === activeCategory}
              onClick={() => {
                setActiveCategory(i);
                setOpenQuestion(faq.categories[i].items[0].q);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                i === activeCategory ? "bg-navy text-white" : "text-muted hover:text-navy"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="mb-2 font-display text-xl font-bold text-navy md:text-2xl">{category.label}</h3>

        {category.items.map((item) => {
          const isOpen = openQuestion === item.q;
          return (
            <div key={item.q} className="border-t border-border last:border-b">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenQuestion(isOpen ? null : item.q)}
                className="flex w-full items-start justify-between gap-5 py-4 text-left"
              >
                <span className="font-display text-[15px] font-bold text-navy md:text-base">{item.q}</span>
                <PlusMinus isOpen={isOpen} />
              </button>
              {/* The answer stays mounted and its row grows from 0fr to 1fr, so the
                  panel eases open at whatever height the text actually needs. */}
              <div
                className={`accordion-panel grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-3xl pb-5 pr-10 text-[14px] leading-relaxed text-body">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
