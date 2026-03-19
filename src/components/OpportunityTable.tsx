import type { OpportunityWithDistance } from "../hooks/useStoreFilter";

interface Props {
  opportunities: OpportunityWithDistance[];
  highlightedId: number | null;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
}

export default function OpportunityTable({
  opportunities,
  highlightedId,
  onHover,
  onClick,
}: Props) {
  return (
    <div className="table-container">
      <table className="opp-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Region</th>
            <th>Genre</th>
            <th>Age</th>
            <th>Cost</th>
            {opportunities.some((o) => o.distance !== null) && <th>Distance</th>}
          </tr>
        </thead>
        <tbody>
          {opportunities.map((opp) => (
            <tr
              key={opp.id}
              className={highlightedId === opp.id ? "highlighted" : ""}
              onMouseEnter={() => onHover(opp.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClick(opp.id)}
            >
              <td>
                <div className="cell-name">{opp.name}</div>
                {opp.address && (
                  <div className="cell-address">{opp.address}</div>
                )}
              </td>
              <td>
                <span
                  className="type-badge"
                  data-type={opp.type.toLowerCase().replace(/\s+/g, "-")}
                >
                  {opp.type}
                </span>
              </td>
              <td>{opp.region}</td>
              <td>{opp.genre || "—"}</td>
              <td>{opp.age || "—"}</td>
              <td>{opp.cost || "—"}</td>
              {opp.distance !== null && (
                <td className="cell-distance">
                  {opp.distance < 1
                    ? `${Math.round(opp.distance * 1000)}m`
                    : `${opp.distance.toFixed(1)}km`}
                </td>
              )}
            </tr>
          ))}
          {opportunities.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                No opportunities match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
