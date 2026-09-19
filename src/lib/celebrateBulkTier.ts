export function celebrateBulkTier() {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const colors = ["#6d4c3d", "#d9a441", "#e78a72", "#8ebf9f"];
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.62;

  for (let index = 0; index < 28; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 28;
    const distance = 48 + Math.random() * 92;
    particle.setAttribute("aria-hidden", "true");
    Object.assign(particle.style, {
      position: "fixed",
      left: `${originX}px`,
      top: `${originY}px`,
      width: "7px",
      height: "7px",
      borderRadius: "999px",
      background: colors[index % colors.length],
      pointerEvents: "none",
      zIndex: "200",
      transform: "translate(-50%, -50%) scale(1)",
      opacity: "1",
    });
    document.body.appendChild(particle);
    const animation = particle.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0.25)`,
          opacity: 0,
        },
      ],
      { duration: 720, easing: "cubic-bezier(.23,1,.32,1)", fill: "forwards" },
    );
    animation.addEventListener("finish", () => particle.remove(), { once: true });
  }
}
