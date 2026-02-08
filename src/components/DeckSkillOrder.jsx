function DeckSkillOrder({ items, text }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  if (!safeItems.length) {
    return <span className="deck-meta-value deck-meta-value--skill">{text || ''}</span>
  }

  return (
    <span className="deck-meta-value deck-meta-value--skill">
      <span className="deck-skill-order-flow">
        {safeItems.map((item, index) => (
          <span key={`${item.heroId ?? item.heroName ?? 'skill'}-${item.skill ?? 'x'}-${index}`} className="deck-skill-order-item">
            {item.image ? (
              <img
                className="deck-skill-order-icon"
                src={item.image}
                alt={item.label}
                title={item.label}
              />
            ) : (
              <span className="deck-skill-order-text" title={item.label}>{item.label}</span>
            )}
            {index < safeItems.length - 1 ? (
              <span className="deck-skill-order-arrow" aria-hidden="true">→</span>
            ) : null}
          </span>
        ))}
      </span>
    </span>
  )
}

export default DeckSkillOrder
