import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPosts } from "../api/posts";
import { getCommunities } from "../api/communities";
import PostCard from "../components/PostCard";

const POST_TYPES = [
  { value: "", label: "All Types" },
  { value: "standard", label: "Standard" },
  { value: "question", label: "Question" },
  { value: "article", label: "Article" },
];

const ORDERINGS = [
  { value: "new", label: "Newest" },
  { value: "hot", label: "Hot" },
  { value: "top", label: "Top" },
];

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Controlled input (what user types)
  const [inputVal, setInputVal] = useState(searchParams.get("q") || "");

  // Active filter state — search fires when these change
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [postType, setPostType] = useState(searchParams.get("type") || "");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") || "new");
  const [community, setCommunity] = useState(searchParams.get("community") || "");

  const [results, setResults] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Track if any search has ever been submitted so we show the right empty state
  const hasFilters = query || postType || community;

  // Load communities once for the filter dropdown
  useEffect(() => {
    getCommunities()
      .then((r) => setCommunities(r.data))
      .catch(() => {});
  }, []);

  // ----------------------------------------------------------
  // Run search whenever any filter changes.
  // We do NOT use useCallback here — just read the values
  // directly from the closure to avoid stale reference bugs.
  // ----------------------------------------------------------
  useEffect(() => {
    if (!query && !postType && !community) {
      setResults([]);
      setSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSearched(true);

    getPosts({ search: query, post_type: postType, ordering, community })
      .then((res) => {
        if (!cancelled) setResults(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query, postType, ordering, community]); // all deps are primitives — no stale closure risk

  const handleSubmit = (e) => {
    e.preventDefault();
    setQuery(inputVal);
    // Mirror to URL so the page is bookmarkable
    const p = {};
    if (inputVal) p.q = inputVal;
    if (postType) p.type = postType;
    if (ordering !== "new") p.ordering = ordering;
    if (community) p.community = community;
    setSearchParams(p);
  };

  const clearFilters = () => {
    setPostType("");
    setCommunity("");
    setOrdering("new");
  };

  const filtersActive = postType || community || ordering !== "new";

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Search</h1>

      {/* Search bar */}
      <form onSubmit={handleSubmit} style={styles.searchForm}>
        <div style={styles.searchWrapper}>
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            style={styles.searchInput}
            placeholder="Search posts by title or content..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" style={styles.searchBtn}>Search</button>
      </form>

      <div style={styles.layout}>
        {/* ── Filter sidebar ── */}
        <aside>
          <div style={styles.filterCard}>
            <h3 style={styles.filterTitle}>Filters</h3>

            {/* Post Type */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Post Type</label>
              {POST_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPostType(value)}
                  className={postType === value ? "btn-primary" : "btn-secondary"}
                  style={styles.filterBtn}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort By */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Sort By</label>
              {ORDERINGS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOrdering(value)}
                  className={ordering === value ? "btn-primary" : "btn-secondary"}
                  style={styles.filterBtn}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Community */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Community</label>
              {communities.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>No communities yet</p>
              ) : (
                <select
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  style={styles.select}
                >
                  <option value="">All Communities</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-danger"
                style={styles.filterBtn}
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* ── Results ── */}
        <div>
          {loading && <p style={styles.hint}>Searching...</p>}

          {!loading && !searched && (
            <div style={styles.emptyState}>
              <p style={styles.hint}>Type something above or pick a filter to search posts.</p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.hint}>No posts found. Try different keywords or filters.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <p style={styles.resultCount}>{results.length} result{results.length !== 1 ? "s" : ""}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {results.map((post) => (
                  <div key={post.id}>
                    {post.community_name && (
                      <div style={{ marginBottom: "4px" }}>
                        <span
                          onClick={() => navigate(`/communities/${post.community_slug}`)}
                          style={styles.communityTag}
                        >
                          {post.community_name}
                        </span>
                      </div>
                    )}
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1100px", margin: "30px auto", padding: "0 24px" },
  title: { margin: "0 0 24px", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.5px", textTransform: "uppercase" },

  searchForm: { display: "flex", gap: "12px", marginBottom: "32px" },
  searchWrapper: { flex: 1, position: "relative" },
  searchIcon: { position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", width: "18px", height: "18px", color: "#9ca3af", pointerEvents: "none" },
  searchInput: { width: "100%", paddingLeft: "48px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px", fontSize: "15px", marginBottom: 0 },
  searchBtn: { whiteSpace: "nowrap", padding: "0 28px" },

  layout: { display: "grid", gridTemplateColumns: "220px 1fr", gap: "28px", alignItems: "start" },

  filterCard: { background: "white", border: "var(--brutal-border)", borderRadius: "12px", boxShadow: "var(--brutal-shadow)", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" },
  filterTitle: { margin: 0, fontSize: "16px", fontWeight: "800" },
  filterGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  filterLabel: { fontSize: "11px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" },
  filterBtn: { width: "100%", textAlign: "left", borderRadius: "8px", padding: "8px 12px", fontSize: "13px" },
  select: { padding: "9px 12px", fontSize: "13px", fontFamily: "inherit", marginBottom: 0, borderRadius: "8px" },

  resultCount: { margin: "0 0 16px", fontSize: "14px", fontWeight: "600", color: "#6b7280" },
  emptyState: { display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" },
  hint: { color: "#9ca3af", fontSize: "15px", textAlign: "center" },
  communityTag: { background: "var(--cat-discussion)", border: "var(--brutal-border)", borderRadius: "9999px", padding: "2px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-block", boxShadow: "2px 2px 0 #000" },
};

export default SearchPage;
