import type { ReactNode } from "react";
import type { Battery } from "@/lib/cogat/scores";

/*
 * Original practice-style items in the formats CogAT uses at Level 8 (picture
 * analogies, picture classification, number analogies, number series, figure
 * matrices, paper folding). None are real CogAT items.
 *
 * Every item is authored with accessibility metadata from the start:
 *  - prompt: the spoken direction (also shown as a caption)
 *  - every visual has a text alternative that describes WITHOUT solving
 *  - figure items use shape and line weight, never color, as the attribute
 */

export type Choice = { id: string; alt: string; render: ReactNode };
export type Item = {
  id: string;
  battery: Battery;
  format: string;
  prompt: string;
  promptEs: string;
  stimulusAlt: string;
  stimulus: ReactNode;
  choices: Choice[];
  answer: string;
  practice?: boolean;
};

function Pic({ e, label }: { e: string; label: string }) {
  return (
    <span role="img" aria-label={label} className="text-[44px] leading-none select-none">
      {e}
    </span>
  );
}

function Pair({ a, b, aLabel, bLabel }: { a: ReactNode; b: ReactNode; aLabel?: string; bLabel?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border-2 border-line px-3 py-2">
      {a}
      <Arrow label={aLabel && bLabel ? `goes with` : "goes with"} />
      {b}
    </span>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <svg role="img" aria-label={label} width="28" height="16" viewBox="0 0 28 16">
      <path d="M2 8h22M18 2l6 6-6 6" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Blank() {
  return (
    <span role="img" aria-label="empty box, the missing picture" className="grid size-[60px] place-items-center rounded-lg border-2 border-dashed border-line-strong text-3xl font-bold text-dim">
      ?
    </span>
  );
}

/* ---------- Figure primitives (shape + size + fill pattern, never colour) ---------- */

type Shape = "circle" | "square" | "triangle";
function Fig({ shape, size, fill, label }: { shape: Shape; size: "big" | "small"; fill: "solid" | "open" | "striped"; label?: string }) {
  const s = size === "big" ? 22 : 12;
  const c = 30;
  const style = { fill: fill === "solid" ? "currentColor" : fill === "striped" ? "url(#stripes)" : "none", stroke: "currentColor", strokeWidth: 3 };
  return (
    <svg role="img" aria-label={label ?? `${size} ${fill === "open" ? "outlined" : fill} ${shape}`} width="60" height="60" viewBox="0 0 60 60" className="text-ink">
      <defs>
        <pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="2.5" height="6" fill="currentColor" />
        </pattern>
      </defs>
      {shape === "circle" && <circle cx={c} cy={c} r={s} {...style} />}
      {shape === "square" && <rect x={c - s} y={c - s} width={s * 2} height={s * 2} {...style} />}
      {shape === "triangle" && <path d={`M${c} ${c - s} L${c + s} ${c + s * 0.8} L${c - s} ${c + s * 0.8} Z`} {...style} />}
    </svg>
  );
}

function Beads({ counts, label }: { counts: (number | null)[]; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex items-end gap-3">
      {counts.map((n, i) =>
        n === null ? (
          <Blank key={i} />
        ) : (
          <svg key={i} aria-hidden="true" width="26" height="86" viewBox="0 0 26 86" className="text-ink">
            <line x1="13" y1="2" x2="13" y2="84" stroke="currentColor" strokeWidth="2" />
            {Array.from({ length: n }).map((_, j) => (
              <circle key={j} cx="13" cy={78 - j * 11} r="5.5" fill="currentColor" />
            ))}
          </svg>
        ),
      )}
    </span>
  );
}

function BeadChoice({ n }: { n: number }) {
  return <Beads counts={[n]} label={`a rod with ${n} beads`} />;
}

function Paper({ holes, folded, label }: { holes: [number, number][]; folded?: boolean; label: string }) {
  return (
    <svg role="img" aria-label={label} width="64" height="64" viewBox="0 0 64 64" className="text-ink">
      <rect x="4" y="4" width={folded ? 28 : 56} height="56" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      {folded && <path d="M32 4v56" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 3" />}
      {holes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill="currentColor" />
      ))}
    </svg>
  );
}

const choice = (id: string, alt: string, render: ReactNode): Choice => ({ id, alt, render });

export const ITEMS: Item[] = [
  {
    id: "p1",
    practice: true,
    battery: "V",
    format: "Picture analogy",
    prompt: "Let's practice. A bird goes with a nest. A dog goes with which one?",
    promptEs: "Vamos a practicar. Un pájaro va con un nido. ¿Un perro va con cuál?",
    stimulusAlt: "Bird goes with nest. Dog goes with what?",
    stimulus: (
      <span className="flex flex-wrap items-center justify-center gap-4">
        <Pair a={<Pic e="🐦" label="bird" />} b={<Pic e="🪺" label="nest" />} />
        <Pair a={<Pic e="🐕" label="dog" />} b={<Blank />} />
      </span>
    ),
    choices: [choice("a", "bone", <Pic e="🦴" label="bone" />), choice("b", "doghouse", <Pic e="🏠" label="doghouse" />), choice("c", "cat", <Pic e="🐈" label="cat" />), choice("d", "ball", <Pic e="⚽" label="ball" />)],
    answer: "b",
  },
  {
    id: "v1",
    battery: "V",
    format: "Picture classification",
    prompt: "Look at the three pictures in the top row. They are alike in some way. Which picture below goes with them?",
    promptEs: "Mira las tres imágenes de arriba. Se parecen de alguna manera. ¿Cuál imagen de abajo va con ellas?",
    stimulusAlt: "Top row: apple, banana, pear.",
    stimulus: (
      <span className="flex items-center gap-4 rounded-xl border-2 border-line px-4 py-2">
        <Pic e="🍎" label="apple" />
        <Pic e="🍌" label="banana" />
        <Pic e="🍐" label="pear" />
      </span>
    ),
    choices: [choice("a", "carrot", <Pic e="🥕" label="carrot" />), choice("b", "bread", <Pic e="🍞" label="bread" />), choice("c", "grapes", <Pic e="🍇" label="grapes" />), choice("d", "spoon", <Pic e="🥄" label="spoon" />)],
    answer: "c",
  },
  {
    id: "q1",
    battery: "Q",
    format: "Number analogy",
    prompt: "One star goes with two stars. Three moons go with how many moons?",
    promptEs: "Una estrella va con dos estrellas. ¿Tres lunas van con cuántas lunas?",
    stimulusAlt: "1 star goes with 2 stars. 3 moons go with what?",
    stimulus: (
      <span className="flex flex-wrap items-center justify-center gap-4">
        <Pair a={<Pic e="⭐" label="1 star" />} b={<Pic e="⭐⭐" label="2 stars" />} />
        <Pair a={<Pic e="🌙🌙🌙" label="3 moons" />} b={<Blank />} />
      </span>
    ),
    choices: [
      choice("a", "3 moons", <Pic e="🌙🌙🌙" label="3 moons" />),
      choice("b", "4 moons", <Pic e="🌙🌙🌙🌙" label="4 moons" />),
      choice("c", "6 moons", <Pic e="🌙🌙🌙🌙🌙🌙" label="6 moons" />),
      choice("d", "2 moons", <Pic e="🌙🌙" label="2 moons" />),
    ],
    answer: "b",
  },
  {
    id: "q2",
    battery: "Q",
    format: "Number series",
    prompt: "The bead rods follow a pattern. Which rod comes next?",
    promptEs: "Las varillas de cuentas siguen un patrón. ¿Cuál varilla sigue?",
    stimulusAlt: "Rods with 1, 3 and 5 beads, then an empty box.",
    stimulus: <Beads counts={[1, 3, 5, null]} label="Rods with 1 bead, 3 beads, 5 beads, then the missing rod" />,
    choices: [choice("a", "6 beads", <BeadChoice n={6} />), choice("b", "7 beads", <BeadChoice n={7} />), choice("c", "5 beads", <BeadChoice n={5} />), choice("d", "2 beads", <BeadChoice n={2} />)],
    answer: "b",
  },
  {
    id: "n1",
    battery: "N",
    format: "Figure matrix",
    prompt: "The top two shapes go together in a certain way. Which shape goes with the bottom one in the same way?",
    promptEs: "Las dos figuras de arriba van juntas de cierta manera. ¿Cuál figura va con la de abajo de la misma manera?",
    stimulusAlt: "Top row: big solid circle goes with small solid circle. Bottom row: big solid square goes with what?",
    stimulus: (
      <span className="grid grid-cols-2 gap-2 rounded-xl border-2 border-line p-2">
        <Fig shape="circle" size="big" fill="solid" />
        <Fig shape="circle" size="small" fill="solid" />
        <Fig shape="square" size="big" fill="solid" />
        <span className="grid place-items-center">
          <Blank />
        </span>
      </span>
    ),
    choices: [
      choice("a", "small solid circle", <Fig shape="circle" size="small" fill="solid" />),
      choice("b", "big solid square", <Fig shape="square" size="big" fill="solid" />),
      choice("c", "small solid square", <Fig shape="square" size="small" fill="solid" />),
      choice("d", "small outlined square", <Fig shape="square" size="small" fill="open" />),
    ],
    answer: "c",
  },
  {
    id: "n2",
    battery: "N",
    format: "Paper folding",
    prompt: "A square paper is folded in half. One hole is punched through both layers. When the paper is opened, what will it look like?",
    promptEs: "Un papel cuadrado se dobla por la mitad. Se hace un agujero a través de las dos capas. Al abrir el papel, ¿cómo se verá?",
    stimulusAlt: "A paper folded in half along a vertical line, with one hole punched near the top of the folded half.",
    stimulus: (
      <span className="flex items-center gap-3">
        <Paper holes={[]} label="A square sheet of paper" />
        <Arrow label="is folded to" />
        <Paper holes={[[18, 20]]} folded label="the paper folded in half, with one hole punched near the top" />
      </span>
    ),
    choices: [
      choice("a", "one hole near the top on the left", <Paper holes={[[18, 20]]} label="one hole near the top on the left" />),
      choice("b", "two holes near the top, one on each side", <Paper holes={[[18, 20], [46, 20]]} label="two holes near the top, one on each side" />),
      choice("c", "two holes on the left, top and bottom", <Paper holes={[[18, 20], [18, 44]]} label="two holes on the left, top and bottom" />),
      choice("d", "two holes near the bottom", <Paper holes={[[18, 44], [46, 44]]} label="two holes near the bottom" />),
    ],
    answer: "b",
  },
];
