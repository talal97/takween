"use client";

import * as Accordion from "@radix-ui/react-accordion";

export function AccordionBlock({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-2">
      {items.map((item, i) => (
        <Accordion.Item key={i} value={`item-${i}`} className="rounded-md border">
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:text-brand">
              <span>{item.q}</span>
              <span className="ml-2 text-muted-foreground">+</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-4 pb-4 text-sm leading-6 text-muted-foreground">
            {item.a}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}