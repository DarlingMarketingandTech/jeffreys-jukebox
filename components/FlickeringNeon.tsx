interface FlickeringNeonProps {
  text?: string;
}

export function FlickeringNeon({ text = "OPEN" }: FlickeringNeonProps) {
  return (
    <aside className="flickering-neon" aria-hidden="true">
      <span>{text}</span>
    </aside>
  );
}
