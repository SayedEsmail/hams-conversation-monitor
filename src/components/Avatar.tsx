const COLORS = [
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
]

// A circle with the first letter of the name. The colour is picked from the name
// itself, so a customer has the same colour in the list and in the thread.
export function Avatar({ name }: { name: string }) {
  const color = COLORS[(name.charCodeAt(0) + name.length) % COLORS.length]

  return (
    // aria-hidden: decoration only, the name is always shown next to it.
    <span
      aria-hidden
      className={`grid size-10 shrink-0 place-items-center rounded-full font-semibold ${color}`}
    >
      {name[0]}
    </span>
  )
}
